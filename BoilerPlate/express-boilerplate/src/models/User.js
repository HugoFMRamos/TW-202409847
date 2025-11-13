import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  const { _id, name, email, role, createdAt, updatedAt } = this.toObject();
  return { id: _id, name, email, role, createdAt, updatedAt };
};

export const User = mongoose.model('User', userSchema);