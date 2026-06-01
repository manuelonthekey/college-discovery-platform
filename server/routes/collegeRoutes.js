import express from "express";
import College from "../models/College.js";

const router = express.Router();

/**
 * @route   GET /api/colleges
 * @desc    Get all colleges with advanced search, filtering, and sorting
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    // 1. Print incoming queries to the backend terminal for easy debugging
    console.log("📥 Incoming URL Queries:", req.query);

    // 2. Extract all parameters from the URL
    const {
      city,
      name,
      maxFees,
      minRating,
      minAveragePackage,
      course,
      recruiter,
      sort,
    } = req.query;
    let query = {};

    // --- Basic Text Filters ---
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    if (name) {
      query.$or = [
        { name: { $regex: name, $options: "i" } },
        { shortName: { $regex: name, $options: "i" } },
      ];
    }

    // --- Sprint 4: Advanced Filters ---

    // Check inside the featuredCourses array; multiple courses require all terms
    if (course) {
      const courseTerms = (Array.isArray(course) ? course : [course]).filter(
        Boolean,
      );

      if (courseTerms.length > 0) {
        query.$and = courseTerms.map((courseTerm) => ({
          featuredCourses: { $regex: courseTerm, $options: "i" },
        }));
      }
    }

    // Check inside the nested fees object using dot notation
    if (maxFees) {
      query["fees.totalEstimatedFeesPerYear"] = { $lte: Number(maxFees) };
    }

    // Check inside the nested placements array using dot notation
    if (recruiter) {
      query["placements.topRecruiters"] = { $regex: recruiter, $options: "i" };
    }

    if (minAveragePackage) {
      query["placements.averagePackage"] = {
        $gte: Number(minAveragePackage),
      };
    }

    // Check the rating field at root level
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Log the constructed query object before hitting MongoDB
    console.log("🔍 Final MongoDB Query Filter:", query);

    // 3. Build the query chain
    let mongooseQuery = College.find(query);

    // Handle sorting if requested, otherwise default to alphabetical order
    if (sort) {
      const sortBy = sort.split(",").join(" ");
      mongooseQuery = mongooseQuery.sort(sortBy);
    } else {
      mongooseQuery = mongooseQuery.sort("name");
    }

    // 4. Execute the query
    const colleges = await mongooseQuery;

    return res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges,
    });
  } catch (error) {
    console.error(`❌ API Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
