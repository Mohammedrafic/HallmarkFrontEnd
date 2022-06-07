export const disabledBodyOverflow = (disabled: boolean) =>
  disabled ? document.body.classList.add('overflow-hide') : document.body.classList.remove('overflow-hide');

export const windowScrollTop = () =>
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
