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
    // legacy scalar OTP fields removed; using history arrays below
    // store history of hashed reset OTPs (kept even after expiry)
    resetOtps: [
      {
        otpHash: { type: String, required: true },
        expiry: { type: Date, required: true },
        used: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // store history of hashed email verification OTPs
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
