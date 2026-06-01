import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    established: { type: Number },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      address: { type: String }
    },
    fees: {
      tuitionFeePerYear: { type: Number, required: true },
      hostelFeePerYear: { type: Number },
      otherChargesPerYear: { type: Number },
      totalEstimatedFeesPerYear: { type: Number, required: true },
      currency: { type: String, default: 'INR' }
    },
    placements: {
      academicYear: { type: String },
      placementPercentage: { type: Number },
      averagePackage: { type: Number, required: true },
      medianPackage: { type: Number },
      highestPackage: { type: Number },
      topRecruiters: [{ type: String }],
      currency: { type: String, default: 'INR' }
    },
    rating: { type: Number, default: 0.0, min: 0, max: 5 },
    featuredCourses: [{ type: String }],
    website: { type: String }
  },
  {
    timestamps: true
  }
);

const College = mongoose.model('College', collegeSchema);
export default College;