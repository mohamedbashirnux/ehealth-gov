import mongoose from 'mongoose'

// Handle missing MONGODB_URI during build time
if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'development') {
  console.warn('MONGODB_URI is not set. Database operations will fail.')
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fallback'

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // Check if we have a valid URI
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to environment variables')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB