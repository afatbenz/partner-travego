import React from 'react';
import { MapPin, Mail } from 'lucide-react';
import { useGeneralContent } from '@/contexts/GeneralContentContext';
import { OrderDetail } from '@/pages/LandingPage/Orders/FindOrder';

interface InvoiceProps {
  order: OrderDetail;
}

export const Invoice: React.FC<InvoiceProps> = ({ order }) => {
  const { getContentIn } = useGeneralContent();
  const brandLogo = getContentIn('general-config', 'brand-logo');
  const brandNameRaw = getContentIn('general-config', 'brand-name');
  const brandName = brandNameRaw && brandNameRaw.trim() !== '' ? brandNameRaw : 'TraveGo';
  const companyNameRaw = getContentIn('general-config', 'company-name');
  const companyName = companyNameRaw && companyNameRaw.trim() !== '' ? companyNameRaw : 'PT TraveGo Global';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatus = (status: number) => {
    switch (status) {
      case 1: return 'Menunggu Pembayaran';
      case 2: return 'Sudah Dibayar';
      case 3: return 'Kadaluarsa';
      case 4: return 'Batal';
      case 10: return 'Sedang menunggu verifikasi';
      default: return 'Status Tidak Diketahui';
    }
  };

  return (
    <div className="hidden print:block p-8 max-w-[210mm] mx-auto bg-white text-black leading-tight">
      {/* Header */}
      <div className="flex justify-between items-start mb-2 border-b pb-2">
        <div className="flex items-center gap-3">
          {brandLogo ? (
            <img src={brandLogo} alt="Logo" className="h-12 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8" />
              <span className="text-2xl font-bold">{brandName}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{brandName}</h1>
            <p className="text-sm text-gray-500">{companyName}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
          <p className="text-sm text-gray-500">Order ID: {order.order_id}</p>
          <p className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Customer & Order Info Grid */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="p-3 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b">Dipesan Oleh</h3>
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Nama</span>
              <span className="font-medium text-sm text-right flex-1">{order.customer.customer_name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Telepon</span>
              <span className="font-medium text-sm text-right flex-1">{order.customer.customer_phone}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Email</span>
              <span className="font-medium text-sm text-right flex-1">{order.customer.customer_email}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Alamat</span>
              <span className="font-medium text-sm text-right flex-1">{order.customer.customer_address}</span>
            </div>
          </div>
        </div>
        <div className="p-3 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b">Detail Pesanan</h3>
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Armada</span>
              <span className="font-medium text-sm text-right flex-1">{order.fleet_name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Durasi</span>
              <span className="font-medium text-sm text-right flex-1">
                {order.rent_type_label} • {order.duration} {order.duration_uom}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Tanggal Sewa</span>
              <span className="font-medium text-sm text-right flex-1">
                {formatDate(order.pickup.start_date)}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 w-24">Tanggal Kembali</span>
              <span className="font-medium text-sm text-right flex-1">
                {formatDate(order.pickup.end_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pesanan & Addons */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Pesanan</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Harga</th>
            </tr>
          </thead>
          <tbody>
            {/* Main Unit */}
            <tr className="border-b border-gray-100">
              <td className="py-2">
                <div className="font-medium">{order.fleet_name}</div>
                <div className="text-xs text-gray-500">
                  {order.quantity} Unit x {formatCurrency(order.price)}
                </div>
              </td>
              <td className="py-2 text-right align-top">
                {formatCurrency(order.price * order.quantity)}
              </td>
            </tr>
            {/* Addons */}
            {order.addon && order.addon.map((addon, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2">{addon.addon_name}</td>
                <td className="py-2 text-right">{formatCurrency(addon.addon_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment History */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Riwayat Pembayaran</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left bg-gray-50">
              <th className="py-2 px-2 font-medium">Tanggal</th>
              <th className="py-2 px-2 font-medium">Metode</th>
              <th className="py-2 px-2 font-medium">Status</th>
              <th className="py-2 px-2 text-right font-medium">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {[...order.payment]
              .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
              .map((payment, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-1 px-2">{formatDate(payment.payment_date)}</td>
                <td className="py-1 px-2">
                  {payment.payment_type === '1' ? 'Pembayaran Penuh' : 'Down Payment'}
                  <br />
                  <span className="text-xs text-gray-500">{payment.bank_name}</span>
                  <div className="text-xs text-gray-500">Kode Unik: {payment.unique_code}</div>
                </td>
                <td className="py-1 px-2">
                  {getPaymentStatus(payment.status)}
                  {String(payment.payment_type) === '2' && payment.payment_remaining && payment.payment_remaining > 0 && (
                    <div className="text-xs text-red-500 mt-1">
                      Sisa: {formatCurrency(payment.payment_remaining)}
                    </div>
                  )}
                </td>
                <td className="py-1 px-2 text-right font-medium">{formatCurrency(payment.payment_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Amount (Outside Table) */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2 flex justify-between items-center border-t border-gray-200 pt-4">
          <span className="font-bold text-lg">Total Tagihan</span>
          <span className="font-bold text-lg">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-8 border-t">
        <p>Terima kasih atas kepercayaan Anda menggunakan layanan {brandName}.</p>
        <p>Invoice ini sah dan diterbitkan secara komputerisasi.</p>
      </div>
    </div>
  );
};
