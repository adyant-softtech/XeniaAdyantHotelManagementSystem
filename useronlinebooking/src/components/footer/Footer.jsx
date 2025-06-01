import React from 'react';
import styles from './footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
<p>
  Copyright © 2025 HOTEL SATKAR | Design and Maintained by{" "}
  <a href="https://adyant.co.in/" className={styles.footerLink}>Adyant SoftTech</a>

</p>
    </footer>
  );
};

export default Footer;
