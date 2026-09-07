document.addEventListener('DOMContentLoaded', () => {
  const home = document.querySelector('.home') || document.body;

  // Password toggle (delegation)
  home.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.toggle-password');
    if (!toggleBtn) return;

    const wrapper = toggleBtn.closest('.password-wrapper') || toggleBtn.parentElement;
    const passwordInput = wrapper?.querySelector('input[type="password"], input[type="text"]#password, input#password');
    if (!passwordInput) return;

    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    const eyeIcon = wrapper.querySelector('.eye-icon');
    const eyeOffIcon = wrapper.querySelector('.eye-off-icon');
    if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : 'block';
    if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? 'block' : 'none';

    toggleBtn.setAttribute(
      'aria-label',
      isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
    );
  });

  // File upload
  home.addEventListener('change', (e) => {
    const fileInput = e.target.closest('input[type="file"]#file, input#file');
    if (!fileInput) return;

    const fileName = document.getElementById('file-name');
    if (fileName) {
      fileName.textContent =
        fileInput.files.length > 0 ? fileInput.files[0].name : 'No file selected';
    }
  });

  // Color value
  home.addEventListener('input', (e) => {
    if (e.target.id !== 'color' && e.target.type !== 'color') return;
    const colorValue = document.querySelector('.color-value');
    if (colorValue && e.target.value) {
      colorValue.textContent = e.target.value.toUpperCase();
    }
  });

  // Date / time has-value class
  home.addEventListener('change', (e) => {
    const input = e.target;
    if (
      !input.matches(
        'input[type="date"], input[type="time"], input[type="datetime-local"], input[type="month"], input[type="week"]'
      )
    ) {
      return;
    }
    if (input.value) input.classList.add('has-value');
    else input.classList.remove('has-value');
  });
});
