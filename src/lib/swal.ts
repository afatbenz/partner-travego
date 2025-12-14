import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

const swal = Swal.mixin({
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#ef4444',
  allowOutsideClick: false,
});

function alert(title: string, text?: string, icon?: SweetAlertIcon, options?: SweetAlertOptions) {
  return swal.fire({ title, text, icon, ...options });
}

function success(title: string, text?: string, options?: SweetAlertOptions) {
  return alert(title, text, 'success', options);
}

function error(title: string, text?: string, options?: SweetAlertOptions) {
  return alert(title, text, 'error', options);
}

function info(title: string, text?: string, options?: SweetAlertOptions) {
  return alert(title, text, 'info', options);
}

function warning(title: string, text?: string, options?: SweetAlertOptions) {
  return alert(title, text, 'warning', options);
}

function confirm(title: string, text?: string, options?: SweetAlertOptions) {
  return swal.fire({ title, text, icon: 'question', showCancelButton: true, ...options });
}

export { swal, success, error, info, warning, confirm };
export default swal;
