document.addEventListener('DOMContentLoaded', function () {
  // Add an event listener to all radio inputs with class 'nav-item'
  document.querySelectorAll('.nav-item').forEach(radio => {
    radio.addEventListener('change', function () {
      const selectedOption = this.id;

      if (selectedOption === 'opt-1') {
        window.location.href = '/to_do';
      } else if (selectedOption === 'opt-2') {
        window.location.href = '/completed';
      }
    });
  });
});
