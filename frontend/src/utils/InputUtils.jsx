// Created by akanksha on 23rd Oct 2024, 
// reason : to disable scroll-to-change functionality for all input[type=number] fields across the page or inside a specific component in React.

export const disableScrollForNumberInputs = () => {
    // Select all input elements of type number and disable scroll behavior
    const inputs = document.querySelectorAll('input[type=number]');
  
    inputs.forEach(function(input) {
      input.addEventListener('wheel', function(e) {
        e.target.blur(); // Prevent scroll from changing the value
      });
    });
};
  
export const cleanupScrollDisable = () => {
    // Cleanup function to remove event listeners
    const inputs = document.querySelectorAll('input[type=number]');
    inputs.forEach(function(input) {
      input.removeEventListener('wheel', function(e) {
        e.target.blur();
      });
    });
};

// end by akanksha on 23rd Oct 2024, 
// reason : to disable scroll-to-change functionality for all input[type=number] fields across the page or inside a specific component in React.

  