document.addEventListener('DOMContentLoaded', function () {
  // Add an event listener to all radio inputs with class 'nav-item'
  document.querySelectorAll('.bar-item').forEach(radio => {
    radio.addEventListener('change', function () {
      const selectedOption = this.id;

      if (selectedOption === 'filter-tasks') {
        window.location.href = '/to_do';
      } else if (selectedOption === 'filter-completed') {
        window.location.href = '/completed';
      } else if (selectedOption === 'filter-all') {
        window.location.href = '/to_do';
      }
    });
  });
});
