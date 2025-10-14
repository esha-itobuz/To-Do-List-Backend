import mongoose from 'mongoose'
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    resetOtps: [
      {
        otpHash: { type: String, required: true },
        expiry: { type: Date, required: true },
        used: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    emailVerificationOtps: [
      {
        otpHash: { type: String, required: true },
        expiry: { type: Date, required: true },
        used: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)

export default User
