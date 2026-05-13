import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Search, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImagePopup } from '@/components/common/ImagePopup';
import { DetailBanner } from '@/components/common/DetailBanner';
import { ReviewForm } from '@/components/common/ReviewForm';

// Sample data - in real app, this would come from API
const sampleData = {
  id: 1,
  title: "Thailand Bangkok Tour Package - 4 Days 3 Nights",
  location: "111/78 Pattarin, Bangchan, Klongsamwa, Bangkok, Thailand 10510",
  nearestDate: "Sat, 04 Oct 2025",
  duration: "4 Days",
  rating: 10.0,
  reviewCount: 2,
  price: "Rp 2.500.000",
  originalPrice: "Rp 3.000.000",
  images: [
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1523010152108-172551997434?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1512100356956-c1227c331f01?auto=format&fit=crop&q=80&w=1200"
  ],
  description: `
    Nikmati pengalaman wisata yang tak terlupakan di Bangkok, Thailand dengan paket tour 4 hari 3 malam yang telah dirancang khusus untuk memberikan Anda pengalaman terbaik. 

    **Hari 1: Kedatangan & City Tour**
    - Tiba di Bandara Suvarnabhumi Bangkok
    - Transfer ke hotel dan check-in
    - City tour mengunjungi Grand Palace dan Wat Phra Kaew
    - Makan siang di restoran lokal
    - Mengunjungi Wat Pho (Temple of the Reclining Buddha)
    - Shopping di Chatuchak Weekend Market
    - Makan malam di restoran tradisional Thailand

    **Hari 2: Floating Market & Cultural Experience**
    - Sarapan di hotel
    - Mengunjungi Damnoen Saduak Floating Market
    - Naik perahu tradisional dan berbelanja di pasar terapung
    - Mengunjungi Rose Garden untuk pertunjukan budaya Thailand
    - Makan siang dengan masakan Thailand autentik
    - Kembali ke Bangkok dan waktu bebas
    - Makan malam di rooftop restaurant dengan pemandangan kota

    **Hari 3: Temples & Modern Bangkok**
    - Sarapan di hotel
    - Mengunjungi Wat Arun (Temple of Dawn)
    - Naik perahu menyusuri Sungai Chao Phraya
    - Mengunjungi Wat Saket (Golden Mount)
    - Makan siang di Chinatown
    - Shopping di MBK Center dan Siam Paragon
    - Menikmati pemandangan sunset dari Sky Bar
    - Makan malam di restoran mewah

    **Hari 4: Departure**
    - Sarapan di hotel
    - Check-out dari hotel
    - Transfer ke bandara
    - Berangkat ke kota asal

    **Included:**
    - 3 malam akomodasi di hotel bintang 4
    - Transportasi AC selama tour
    - Makan sesuai itinerary (3x breakfast, 3x lunch, 3x dinner)
    - Tiket masuk ke semua tempat wisata
    - Guide berbahasa Indonesia
    - Airport transfer

    **Excluded:**
    - Tiket pesawat internasional
    - Visa (jika diperlukan)
    - Personal expenses
    - Tips untuk guide dan driver
    - Travel insurance
  `,
  features: [
    "Hotel bintang 4",
    "Transportasi AC",
    "Guide berbahasa Indonesia",
    "Makan sesuai itinerary",
    "Tiket masuk semua tempat wisata",
    "Airport transfer"
  ],
  highlights: [
    "Grand Palace & Wat Phra Kaew",
    "Floating Market",
    "Wat Arun Temple",
    "Chatuchak Market",
    "Sky Bar Bangkok",
    "Cultural Show"
  ]
};

export const CatalogDetail: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // In real app, fetch data based on id from useParams
  const data = sampleData;

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleImageChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleOrderNow = () => {
    navigate(`/checkout/catalog/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Thumbnail Background */}
      <section className="relative min-h-[45vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${data.images[0]})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          {/* Navy Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/40 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl mx-auto">
          <div className="max-w-3xl animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span className="font-normal tracking-wide">{data.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-400 fill-current" />
                  <span className="font-normal">{data.rating}/10 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10">
          <svg 
            className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,0.48V120H0Z" 
              className="fill-white dark:fill-gray-950"
            ></path>
          </svg>
        </div>
      </section>

      {/* Image Gallery Grid - Under Wave Divider */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.images.slice(0, 4).map((image, index) => (
              <div 
                key={index}
                className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {index === 3 && data.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold uppercase tracking-widest text-sm">Lihat foto lain</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Stats */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <div className="max-w-7xl mx-auto border-y border-gray-100 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tanggal Terdekat</p>
                <p className="font-normal text-gray-900">{data.nearestDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Durasi Tour</p>
                <p className="font-normal text-gray-900">{data.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-2xl">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rating Pengguna</p>
                <p className="font-normal text-gray-900">{data.rating}/10 ({data.reviewCount} Ulasan)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-blue-600 rounded-full" />
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Deskripsi Paket</h2>
                </div>
                
                <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed">
                  {data.description.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return <br key={index} />;
                    
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    
                    if (paragraph.startsWith('- ')) {
                      return (
                        <div key={index} className="flex items-start gap-3 mb-2 ml-4">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2.5 shrink-0" />
                          <p className="text-gray-600">{paragraph.replace('- ', '')}</p>
                        </div>
                      );
                    }
                    
                    return (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Rating Summary - Moved here below description */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-blue-100/50">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rating Keseluruhan</h3>
                    <div className="flex flex-col gap-2">
                      <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">10.0</div>
                      <div className="flex justify-center md:justify-start text-orange-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-500 font-bold tracking-wide">Berdasarkan {data.reviewCount} ulasan pelanggan</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-600 w-4">{rating}</span>
                        <Star className="h-4 w-4 text-orange-400 fill-current" />
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full" 
                            style={{ width: `${rating === 5 ? 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-400 w-8 text-right">
                          {rating === 5 ? '100%' : '0%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 p-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Harga Mulai Dari</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600">{data.price}</span>
                    <span className="text-sm font-normal text-gray-400">/pax</span>
                  </div>
                  <p className="text-sm text-gray-400 line-through font-semibold">{data.originalPrice}</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-16 font-semibold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
                    onClick={handleOrderNow}
                  >
                    Pesan Sekarang
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 bg-white rounded-2xl h-16 font-semibold text-lg transition-all hover:scale-[1.02]"
                    onClick={() => navigate(`/custom-order/catalog/${data.id}`)}
                  >
                    Ajukan Custom Order
                  </Button>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="space-y-6">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Fasilitas Termasuk</h4>
                  <ul className="space-y-4">
                    {data.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                        <div className="h-2 w-2 bg-blue-600 rounded-full shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="h-px bg-gray-100" />

                  {/* Highlights */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Highlight Wisata</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.highlights.map((highlight, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-600 border-none font-normal text-[10px] px-3 py-1 rounded-lg">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-orange-500 rounded-full" />
                <span className="text-orange-500 font-bold tracking-widest uppercase text-sm">Review Pelanggan</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">Ulasan <span className="text-orange-500">Terbaru</span></h2>
            </div>
            <Button 
              variant="outline" 
              className="rounded-2xl px-8 h-14 font-normal border-gray-200 text-blue-600 hover:bg-blue-50 transition-all"
              onClick={() => navigate(`/reviews/catalog/${data.id}`)}
            >
              Lihat Semua Ulasan (15)
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              
              <div className="space-y-8">
                {/* Review 1 */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-blue-600/20">
                      A
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Ahmad Rizki</h3>
                          <p className="text-sm text-gray-400 font-normal">2 hari yang lalu</p>
                        </div>
                        <div className="flex items-center bg-orange-50 px-3 py-1.5 rounded-xl">
                          <Star className="h-4 w-4 text-orange-500 fill-current mr-1.5" />
                          <span className="font-normal text-orange-600 text-sm">5.0</span>
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed">
                        "Paket tour yang sangat memuaskan! Pelayanan guide sangat baik dan tempat wisata yang dikunjungi sesuai dengan yang dijanjikan. Hotel yang disediakan juga nyaman dan lokasinya strategis. Recommended banget!"
                      </p>
                      
                      {/* Review Images */}
                      <div className="flex gap-3 pt-2">
                        {[1, 2, 3].map((_, i) => (
                          <img
                            key={i}
                            src={data.images[i+1]}
                            alt="Review"
                            className="w-20 h-20 object-cover rounded-2xl border-2 border-white shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Popup */}
      <ImagePopup
        images={data.images}
        currentIndex={selectedImageIndex}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onImageChange={handleImageChange}
        itemType="catalog"
        itemId={data.id.toString()}
      />
    </div>
  );
};
