import io

p = 'src/pages/LandingPage/Armada/ArmadaDetail.tsx'
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_block = r'''      {/* Ulasan — two-column grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Kolom kiri: info panel */}
          <div className="bg-yellow-50 border border-blue-200 rounded-lg p-6 relative overflow-hidden">
            <Sparkles className="absolute -top-3 -right-3 h-6 w-6 text-yellow-300" />
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Pendapat Anda, pengalaman mereka.</h3>
            </div>
            <div className="border-t border-blue-200 mt-2 mb-4" />
            <p className="mb-4 text-gray-700">
              Ulasan Anda membantu kami meningkatkan kualitas layanan dan memberikan pengalaman terbaik bagi setiap pelanggan.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold">Bantu pelanggan lain</div>
                  <div className="text-sm text-gray-600">Ulasan jujur Anda membantu mereka membuat keputusan yang tepat.</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold">Tingkatkan kualitas layanan</div>
                  <div className="text-sm text-gray-600">Masukan Anda menjadi bahan berharga bagi kami untuk terus berbenah.</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold">Hanya butuh 1 menit</div>
                  <div className="text-sm text-gray-600">Ulasan cepat Anda sangat berarti bagi kami.</div>
                </div>
              </li>
            </ul>
            <div className="absolute bottom-0 right-0 -mb-6 -mr-6 opacity-60">
              <svg width="80" height="40" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="25" r="8" fill="#93c5fd"/>
                <circle cx="40" cy="15" r="5" fill="#93c5fd"/>
                <circle cx="60" cy="30" r="6" fill="#93c5fd"/>
              </svg>
            </div>
          </div>

          {/* Kolom kanan: form ulasan & daftar ulasan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Tulis Ulasan Armada</h3>
              <span className="text-sm text-gray-500 ml-auto">Bagikan pengalaman Anda menggunakan layanan kami.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              {/* Order ID input */}
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <span className="text-gray-400 mr-2 font-bold">#</span>
                <input
                  type="text"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="Order ID"
                  className="w-full border-0 p-0 text-sm focus:outline-none"
                />
              </div>
              {/* Star rating */}
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRating(r)}
                      className="p-0.5 focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${r <= selectedRating ? 'text-blue-600 fill-blue-600' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ulasan textarea */}
            <div className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <div className="flex items-center gap-1 mb-1">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                <label className="text-sm text-gray-600 font-medium">Ulasan</label>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder="Bagikan pengalaman Anda..."
                className="w-full resize-none border-0 p-0 text-sm focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              onClick={handleSubmitReview}
              disabled={isSubmitting || !orderIdInput.trim() || selectedRating === 0 || !reviewText.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </Button>

            {/* Privacy notice */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              <Lock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Ulasan Anda akan ditinjau sebelum ditampilkan untuk menjaga kualitas dan keamanan.
              </p>
            </div>

            {/* Daftar ulasan */}
'''

review_list = r'''            {fleet.reviews && fleet.reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {fleet.reviews.map((reviewItem: any, index: number) => {
                  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
                  const formattedDate = new Date(reviewItem.created_at).toLocaleDateString('id-ID', dateOptions).replace('pukul', '');

                  return (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">{reviewItem.customer_name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= reviewItem.star ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed flex-grow">"{reviewItem.review}"</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada ulasan untuk armada ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
'''

new_block += review_list

# Replace lines index 1255..1352 (0-based, inclusive). Verify content first.
print("line 1255 (0-based):", lines[1255].rstrip())
print("line 1352 (0-based):", lines[1352].rstrip())

# sanity check
assert 'full-width' in lines[1255], lines[1255]
assert 'lg:hidden' not in lines[1352], lines[1352]

new_lines = lines[:1255] + [new_block] + lines[1353:]

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done. New line count:", len(new_lines))
