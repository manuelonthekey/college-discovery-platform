import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  RefreshCw,
  Filter,
  GraduationCap,
  Star,
  Briefcase,
  Moon,
  Sun,
  X,
  Globe,
  TrendingUp,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./App.css";

const emptyFilters = {
  maxFees: "",
  minRating: "0",
  minAveragePackage: "",
  recruiter: "",
};

const themeStorageKey = "college-dhundo-theme";

const ImageCarousel = ({ imageAssets, isModal, college, compareList, toggleCompare }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If there are no image assets at all, fall back to a generic container (which shouldn't happen now since we seed fallbacks)
  if (!imageAssets || imageAssets.length === 0) {
    return (
      <div className={isModal ? 'modal-header-image' : 'card-image-placeholder'}>
        <div className={isModal ? 'modal-rating-badge' : 'card-rating'}>
          <Star size={isModal ? 16 : 14} fill="#eab308" color="#eab308" />
          <span>{college?.rating?.toFixed(1) || "N/A"}{isModal ? ' / 5.0' : ''}</span>
        </div>
        {!isModal && compareList && toggleCompare && (
          <button 
            className={`card-compare-btn ${compareList.some(c => c._id === college._id) ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleCompare(college); }}
          >
            {compareList.some(c => c._id === college._id) ? '✓ Selected' : '+ Compare'}
          </button>
        )}
      </div>
    );
  }

  // Prepend virtual logo if no real logo exists
  const hasLogo = imageAssets.some(a => a.type === 'logo');
  const displayAssets = [...imageAssets];
  if (!hasLogo) {
    displayAssets.unshift({ type: 'virtual-logo', url: '' });
  }

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayAssets.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayAssets.length) % displayAssets.length);
  };

  return (
    <div className={isModal ? 'modal-header-image has-image' : 'card-image-placeholder has-image'} style={{ position: 'relative' }}>
      <div className="image-carousel-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <div 
          className="image-carousel-track" 
          style={{ 
            display: 'flex', width: '100%', height: '100%', 
            transform: `translateX(-${currentIndex * 100}%)`, 
            transition: 'transform 0.4s ease-in-out' 
          }}
        >
          {displayAssets.map((asset, index) => {
            if (asset.type === 'virtual-logo') {
              return (
                <div
                  key={index}
                  className="carousel-slide virtual-logo"
                  style={{
                    flex: '0 0 100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '20px',
                    textAlign: 'center'
                  }}
                >
                  <GraduationCap size={44} style={{ marginBottom: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
                  <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {college?.shortName || college?.name}
                  </div>
                  {college?.established && (
                    <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px', fontWeight: '600' }}>
                      ESTD {college.established}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div
                key={index}
                className={`carousel-slide ${asset.type}`}
                style={{ 
                  backgroundImage: `url(${asset.url})`, 
                  flex: '0 0 100%', height: '100%',
                  backgroundSize: asset.type === 'logo' ? 'contain' : 'cover',
                  backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                  backgroundColor: asset.type === 'logo' ? '#ffffff' : 'transparent'
                }}
              />
            );
          })}
        </div>
        {displayAssets.length > 1 && (
          <>
            <button className="carousel-nav-btn left" onClick={handlePrev}>
              <ChevronLeft size={20} />
            </button>
            <button className="carousel-nav-btn right" onClick={handleNext}>
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <div className={isModal ? 'modal-rating-badge' : 'card-rating'}>
        <Star size={isModal ? 16 : 14} fill="#eab308" color="#eab308" />
        <span>{college?.rating?.toFixed(1) || "N/A"}{isModal ? ' / 5.0' : ''}</span>
      </div>
      {!isModal && compareList && toggleCompare && (
        <button 
          className={`card-compare-btn ${compareList.some(c => c._id === college._id) ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleCompare(college); }}
        >
          {compareList.some(c => c._id === college._id) ? '✓ Selected' : '+ Compare'}
        </button>
      )}
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(themeStorageKey) === "dark";
  });
  
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [maxFees, setMaxFees] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [minAveragePackage, setMinAveragePackage] = useState("");
  const [recruiter, setRecruiter] = useState("");
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [selectedCollege, setSelectedCollege] = useState(null);

  // 🌟 NEW: Side-by-Side Comparison State
  const [compareList, setCompareList] = useState([]);
  const [isComparing, setIsComparing] = useState(false);

  const fetchColleges = async (overrideCourses, overrideFilters = {}) => {
    setLoading(true);
    try {
      const targetCourses =
        overrideCourses !== undefined ? overrideCourses : selectedCourses;
      const targetFilters = {
        maxFees,
        minRating,
        minAveragePackage,
        recruiter,
        ...overrideFilters,
      };

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("name", searchTerm);
      if (cityFilter) queryParams.append("city", cityFilter);
      if (targetFilters.maxFees)
        queryParams.append("maxFees", targetFilters.maxFees);
      if (targetFilters.minRating && targetFilters.minRating !== "0")
        queryParams.append("minRating", targetFilters.minRating);
      if (targetFilters.minAveragePackage)
        queryParams.append(
          "minAveragePackage",
          targetFilters.minAveragePackage,
        );
      if (targetFilters.recruiter)
        queryParams.append("recruiter", targetFilters.recruiter);
      targetCourses.forEach((course) => {
        queryParams.append("course", course);
      });

      // VITE_API_URL must be set in Netlify env vars to the Render backend URL
      // Falls back to localhost in local dev
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${baseUrl}/api/colleges?${queryParams.toString()}`,
      );
      const result = await response.json();

      if (result.success) {
        setColleges(result.data);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Prevent background scrolling when ANY modal is open
  useEffect(() => {
    if (selectedCollege || isComparing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedCollege, isComparing]);

  const handleCourseClick = (courseName) => {
    const nextCourses = selectedCourses.includes(courseName)
      ? selectedCourses.filter((course) => course !== courseName)
      : [...selectedCourses, courseName];

    setSelectedCourses(nextCourses);
    fetchColleges(nextCourses);
  };

  const handleDraftFilterChange = (filterName, value) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }));
  };

  const openFilterMenu = () => {
    setDraftFilters({
      maxFees,
      minRating,
      minAveragePackage,
      recruiter,
    });
    setShowFilters(true);
  };

  const applyFilters = () => {
    setMaxFees(draftFilters.maxFees);
    setMinRating(draftFilters.minRating);
    setMinAveragePackage(draftFilters.minAveragePackage);
    setRecruiter(draftFilters.recruiter);
    setShowFilters(false);
    fetchColleges(undefined, draftFilters);
  };

  // 🌟 NEW: Comparison Handlers
  const toggleCompare = (college) => {
    setCompareList((prev) => {
      if (prev.some((c) => c._id === college._id)) {
        return prev.filter((c) => c._id !== college._id);
      }
      if (prev.length >= 3) {
        alert("You can compare a maximum of 3 colleges at a time.");
        return prev;
      }
      return [...prev, college];
    });
  };

  const clearCompareList = () => setCompareList([]);

  const hasAdvancedFilters =
    Boolean(maxFees) ||
    Boolean(minAveragePackage) ||
    Boolean(recruiter) ||
    (minRating && minRating !== "0");

  const quickCourses = [
    "Computer",
    "Electrical",
    "Mechanical",
    "Software",
    "Chemical",
  ];

  return (
    <div className={`app-container ${isDarkMode ? "dark-mode" : ""}`}>
      {/* HEADER */}
      <header className="navbar">
        <div className="logo-container">
          <GraduationCap size={32} className="logo-icon" />
          <h1>College Dhundo</h1>
        </div>
        <nav className="nav-links">
          <a href="#">Explore</a>
          <a href="#">About</a>
          <a 
            href="#" 
            className="compare-link"
            onClick={(e) => {
              e.preventDefault();
              if (compareList.length > 0) setIsComparing(true);
            }}
          >
            Compare {compareList.length > 0 && `(${compareList.length})`}
          </a>
          <button
            className="theme-toggle-btn"
            type="button"
            onClick={() => setIsDarkMode((currentMode) => !currentMode)}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="sign-in-btn">Sign In</button>
        </nav>
      </header>

      <main className="main-content">
        {/* SEARCH CONTROL CENTER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="search-hub"
        >
          <h2>Find Your Ideal Campus.</h2>

          <div className="search-inputs">
            {/* ... Your existing search inputs ... */}
            <div className="input-group">
              <label className="input-label">Search by College Name</label>
              <div className="input-wrapper">
                <Search className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search IIT, BITS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">City/Location</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="City (e.g., Mumbai)"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                />
              </div>
            </div>

            <button
              className="search-action-btn"
              onClick={() => fetchColleges()}
            >
              Search
            </button>
            <div className="filter-menu-wrap">
              <button
                className={`filter-toggle-btn ${
                  hasAdvancedFilters ? "active" : ""
                }`}
                onClick={() =>
                  showFilters ? setShowFilters(false) : openFilterMenu()
                }
              >
                <Filter size={16} /> Filter
              </button>

              {showFilters && (
                <div className="filter-popover">
                  {/* ... Your existing popover filters ... */}
                  <div className="filter-popover-grid">
                    <div className="filter-group">
                      <label className="input-label">Max Annual Budget (Fees)</label>
                      <div className="slider-container">
                        <input
                          type="range"
                          min="150000"
                          max="700000"
                          step="25000"
                          value={draftFilters.maxFees || "700000"}
                          onChange={(e) =>
                            handleDraftFilterChange("maxFees", e.target.value)
                          }
                        />
                        <span className="slider-value">
                          {draftFilters.maxFees
                            ? `Rs ${Number(draftFilters.maxFees).toLocaleString("en-IN")}`
                            : "Any Budget"}
                        </span>
                      </div>
                    </div>
                    <div className="filter-group">
                      <label className="input-label">Minimum Rating</label>
                      <select
                        className="filter-select"
                        value={draftFilters.minRating}
                        onChange={(e) =>
                          handleDraftFilterChange("minRating", e.target.value)
                        }
                      >
                        <option value="0">Any Rating</option>
                        <option value="4.0">4.0+</option>
                        <option value="4.5">4.5+</option>
                        <option value="4.8">4.8+</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label className="input-label">Minimum Avg Package</label>
                      <div className="slider-container">
                        <input
                          type="range"
                          min="500000"
                          max="2500000"
                          step="100000"
                          value={draftFilters.minAveragePackage || "500000"}
                          onChange={(e) =>
                            handleDraftFilterChange("minAveragePackage", e.target.value)
                          }
                        />
                        <span className="slider-value">
                          {draftFilters.minAveragePackage
                            ? `Rs ${(Number(draftFilters.minAveragePackage) / 100000).toFixed(1)} LPA`
                            : "Any Package"}
                        </span>
                      </div>
                    </div>
                    <div className="filter-group">
                      <label className="input-label">Top Recruiter</label>
                      <div className="input-wrapper minimal">
                        <Briefcase className="input-icon" size={16} />
                        <input
                          type="text"
                          placeholder="e.g., Google, Adobe"
                          value={draftFilters.recruiter}
                          onChange={(e) =>
                            handleDraftFilterChange("recruiter", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="filter-popover-actions">
                    <button
                      className="filter-clear-btn"
                      onClick={() => setDraftFilters({ ...emptyFilters })}
                    >
                      Clear
                    </button>
                    <button className="filter-apply-btn" onClick={applyFilters}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="advanced-filters-panel">
            {/* ... Your existing advanced filters ... */}
            <div className="filter-group">
              <label className="input-label">Max Annual Budget (Fees)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="150000"
                  max="700000"
                  step="25000"
                  value={maxFees || "700000"}
                  onChange={(e) => setMaxFees(e.target.value)}
                />
                <span className="slider-value">
                  {maxFees ? `₹${Number(maxFees).toLocaleString("en-IN")}` : "Any Budget"}
                </span>
              </div>
            </div>
            <div className="filter-group">
              <label className="input-label">Minimum Rating</label>
              <select
                className="filter-select"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="0">Any Rating</option>
                <option value="4.0">⭐ 4.0+</option>
                <option value="4.5">⭐ 4.5+</option>
                <option value="4.8">⭐ 4.8+</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="input-label">Top Recruiter</label>
              <div className="input-wrapper minimal">
                <Briefcase className="input-icon" size={16} />
                <input
                  type="text"
                  placeholder="e.g., Google, Adobe"
                  value={recruiter}
                  onChange={(e) => setRecruiter(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="quick-tags">
            {quickCourses.map((course) => (
              <button
                key={course}
                className={`tag-btn ${selectedCourses.includes(course) ? "active" : ""}`}
                onClick={() => handleCourseClick(course)}
              >
                {course}
              </button>
            ))}
            <button
              className="reset-btn"
              onClick={() => {
                setSearchTerm("");
                setCityFilter("");
                setSelectedCourses([]);
                setMaxFees("");
                setMinRating("0");
                setMinAveragePackage("");
                setRecruiter("");
                setDraftFilters({ ...emptyFilters });
                setShowFilters(false);
                setColleges([]);
                setTimeout(() => {
                  fetchColleges([], { ...emptyFilters });
                }, 50);
              }}
            >
              <RefreshCw size={16} /> Reset All
            </button>
          </div>
        </motion.div>

        {/* RESULTS GRID */}
        <motion.div layout className="college-grid">
          <AnimatePresence>
            {loading ? (
              <p className="loading-text">Scanning the cloud...</p>
            ) : colleges.length > 0 ? (
              colleges.map((college) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{
                    y: -8,
                    boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
                  }}
                  key={college._id}
                  className="college-card"
                  onClick={() => setSelectedCollege(college)} 
                  style={{ cursor: "pointer" }} 
                >
                  <ImageCarousel 
                    imageAssets={college.imageAssets} 
                    isModal={false} 
                    college={college} 
                    compareList={compareList} 
                    toggleCompare={toggleCompare} 
                  />

                  <div className="card-content">
                    <h3>{college.name}</h3>
                    <div className="card-meta-row">
                      <p className="location">
                        <MapPin size={14} /> {college.location?.city}
                      </p>
                    </div>
                    {college.featuredCourses && (
                      <div className="card-tags">
                        {college.featuredCourses.slice(0, 2).map((c, i) => (
                          <span key={i} className="mini-tag">
                            {c.split(" (")[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="no-results"
              >
                No campuses match your exact parameters. Try widening your filters!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* THE COLLEGE DETAIL MODAL */}
        <AnimatePresence>
          {selectedCollege && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCollege(null)}
            >
              <motion.div
                className="modal-content-card"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()} 
              >
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedCollege(null)}
                >
                  <X size={24} />
                </button>

                <ImageCarousel 
                  imageAssets={selectedCollege.imageAssets} 
                  isModal={true} 
                  college={selectedCollege} 
                />

                <div className="modal-body">
                  <h2>{selectedCollege.name}</h2>
                  <p className="modal-location">
                    <MapPin size={16} /> {selectedCollege.location?.city},{" "}
                    {selectedCollege.location?.state}
                  </p>

                  <div className="modal-grid">
                    {/* PLACEMENTS SECTION */}
                    <div className="modal-section">
                      <h3><TrendingUp size={18} /> Placement Stats</h3>
                      <div className="stats-box">
                        <div className="stat-item">
                          <span>Average Package</span>
                          <strong>
                            ₹{(selectedCollege.placements?.averagePackage / 100000).toFixed(1)} LPA
                          </strong>
                        </div>
                        <div className="stat-item highlight">
                          <span>Highest Package</span>
                          <strong>
                            ₹{(selectedCollege.placements?.highestPackage / 100000).toFixed(1)} LPA
                          </strong>
                        </div>
                      </div>
                      <div className="recruiters-list">
                        <h4>Top Recruiters:</h4>
                        <div className="recruiter-tags">
                          {selectedCollege.placements?.topRecruiters?.map((recruiter, i) => (
                            <span key={i} className="recruiter-pill">
                              {recruiter}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* FEES SECTION */}
                    <div className="modal-section">
                      <h3><Building size={18} /> Fee Breakdown (Per Year)</h3>
                      <div className="stats-box outline">
                        <div className="stat-item">
                          <span>Tuition Fee</span>
                          <strong>₹{selectedCollege.fees?.tuitionFeePerYear?.toLocaleString("en-IN") || "N/A"}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Hostel & Mess</span>
                          <strong>₹{selectedCollege.fees?.hostelFeePerYear?.toLocaleString("en-IN") || "N/A"}</strong>
                        </div>
                        <div className="stat-item total">
                          <span>Total Estimated</span>
                          <strong>₹{selectedCollege.fees?.totalEstimatedFeesPerYear?.toLocaleString("en-IN") || "N/A"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-courses">
                    <h3>Programs Offered</h3>
                    <div className="course-tags">
                      {selectedCollege.featuredCourses?.map((course, i) => (
                        <span key={i} className="course-pill">{course}</span>
                      ))}
                    </div>
                  </div>

                  {selectedCollege.website && (
                    <a
                      href={selectedCollege.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-btn"
                    >
                      <Globe size={18} /> Visit Official Website
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🌟 NEW: STICKY BOTTOM COMPARE BAR */}
        <AnimatePresence>
          {compareList.length > 0 && !isComparing && (
            <motion.div 
              className="compare-sticky-bar"
              initial={{ y: 100, opacity: 0, x: "-50%" }}
              animate={{ y: 0, opacity: 1, x: "-50%" }}
              exit={{ y: 100, opacity: 0, x: "-50%" }}
              style={{ left: "50%", position: "fixed" }} 
            >
              <div className="compare-bar-info">
                <strong>{compareList.length}</strong> {compareList.length === 1 ? 'college' : 'colleges'} selected to compare
              </div>
              <div className="compare-bar-actions">
                <button className="clear-all-btn" onClick={clearCompareList}>Clear All</button>
                <button className="launch-compare-btn" onClick={() => setIsComparing(true)}>
                  Compare Side-by-Side
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🌟 NEW: FULL SCREEN COMPARISON OVERLAY */}
        <AnimatePresence>
          {isComparing && (
            <motion.div 
              className="comparison-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="comparison-container">
                
                <div className="comparison-header">
                  <h2>College Comparison Matrix</h2>
                  <button className="close-comparison-btn" onClick={() => setIsComparing(false)}>
                    <X size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}/>
                    Back to Search
                  </button>
                </div>

                <div className="comparison-grid" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
                  
                  {/* Row 1: Headers & Names */}
                  <div className="matrix-label column-header">Feature</div>
                  {compareList.map(college => (
                    <div key={college._id} className="matrix-value column-header text-brand">
                      <h3>{college.name}</h3>
                      <button className="remove-col-btn" onClick={() => toggleCompare(college)}>Remove</button>
                    </div>
                  ))}

                  {/* Row 2: Location */}
                  <div className="matrix-label">Location</div>
                  {compareList.map(college => (
                    <div key={college._id} className="matrix-value">
                      {college.location?.city}, {college.location?.state}
                    </div>
                  ))}

                  {/* Row 3: Fees */}
                  <div className="matrix-label">Annual Fees</div>
                  {compareList.map(college => (
                    <div key={college._id} className="matrix-value price-highlight">
                      ₹{college.fees?.totalEstimatedFeesPerYear?.toLocaleString("en-IN") || "N/A"}
                    </div>
                  ))}

                  {/* Row 4: Placements */}
                  <div className="matrix-label">Avg Placement</div>
                  {compareList.map(college => (
                    <div key={college._id} className="matrix-value score-highlight">
                      <strong>₹{college.placements?.averagePackage ? (college.placements.averagePackage / 100000).toFixed(1) : "N/A"} LPA</strong>
                      <span className="sub-metric">High: ₹{college.placements?.highestPackage ? (college.placements.highestPackage / 100000).toFixed(1) : "N/A"} LPA</span>
                    </div>
                  ))}

                  {/* Row 5: Top Recruiters */}
                  <div className="matrix-label">Top Recruiters</div>
                  {compareList.map(college => (
                    <div key={college._id} className="matrix-value tags-cell">
                      {college.placements?.topRecruiters?.slice(0, 3).map((r, idx) => (
                        <span key={idx} className="matrix-pill">{r}</span>
                      )) || "N/A"}
                    </div>
                  ))}

                  {/* Row 6: User Rating */}
                  <div className="matrix-label">User Rating</div>
                  {compareList.map(college => (
                    <div key={college._id} className="matrix-value">
                      ⭐ {college.rating?.toFixed(1) || "N/A"} / 5
                    </div>
                  ))}

                  {/* Row 7: Programs Offered */}
                  <div className="matrix-label">Programs Offered</div>
                  {compareList.map(college => (
                    <div key={college._id} className="matrix-value tags-cell">
                      {college.featuredCourses?.map((course, idx) => (
                        <span key={idx} className="matrix-pill">{course}</span>
                      )) || "N/A"}
                    </div>
                  ))}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default App;