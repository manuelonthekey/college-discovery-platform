
import { Globe, Heart, Link as LinkIcon, MessageCircle, Briefcase, Code } from 'lucide-react';
import './UniversalFooter.css';

const UniversalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="universal-footer">
      <div className="footer-content">
        <div className="footer-top">
          
          <div className="footer-links-section">
            <div className="footer-links-col">
              <h4>Socials</h4>
              <a href="https://github.com/manuelonthekey" target="_blank" rel="noopener noreferrer">
                <Code size={16} /> GitHub
              </a>
              <a href="www.linkedin.com/in/manojit-maitra" target="_blank" rel="noopener noreferrer">
                <Briefcase size={16} /> LinkedIn
              </a>
              {/*<a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> Twitter/X
              </a>*/}
            </div>
            
            <div className="footer-links-col">
              <h4>Other Projects</h4>
              {/*<a href="#" target="_blank" rel="noopener noreferrer">
                <Globe size={16} /> Portfolio
              </a>*/}
              <a href="https://equipzense.netlify.app" target="_blank" rel="noopener noreferrer">EquipZenSe</a>
              {/*<a href="#" target="_blank" rel="noopener noreferrer">Project Beta</a>*/}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>
            Made with <Heart size={14} className="heart-icon" /> by <strong>ManojitMaitra</strong>
          </p>
          <p className="copyright">&copy; {currentYear} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default UniversalFooter;
