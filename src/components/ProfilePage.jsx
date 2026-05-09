export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#624633] mb-1">Profil Saya</h2>
        <p className="text-sm text-gray-500">Kelola informasi personal dan preferensi akun Anda.</p>
      </div>

      {/* Profile Identity Card */}
      <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#f8f5f1] to-transparent rounded-bl-full pointer-events-none opacity-50"></div>

        <div className="relative z-10">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#f8f5f1] shadow-lg relative">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu1VX7-YQC8e-JmHClPrC0FHyGKrm1Iz3fuyyaXcSWp5x-pPsrTrauHZodbb5B-0fH2v5HSBWjvDnq4oo46I9Wg7NRqX7BQzHq9jw1Ee8sb8zNAkhteFoP6sfYnX9KGpRZdF7VHtWttpcFlX8gW4Zxn5pEPpIhC0Pxnhp35teXMpW7LybzJJQxv9WceWVtpizTHgy7FUOs5YTY6EolIxyiLwMulhzJz_HUr7-qxKElOI0uhlhe069kwNHOc9OYN6Z9pi5An4I1jQ"
            />
            <button className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] font-bold py-1 backdrop-blur-sm hover:bg-black/60 transition-colors">
              Ubah Foto
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <h3 className="text-3xl font-black text-[#624633]">Budi Darmawan</h3>
            <span className="material-symbols-outlined text-[#4ade80] text-xl" title="Akun Terverifikasi">verified</span>
          </div>
          <p className="text-sm font-semibold text-[#8c7462] mb-4">budi.darmawan@email.com</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
            <div className="inline-flex items-center gap-1.5 bg-[#f8f5f1] text-[#624633] px-3 py-1.5 rounded-full text-xs font-bold border border-[#e6ceb3]/50">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Administrator
            </div>
            <div className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Bergabung sejak 2024
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep Goals & Preferences */}
        <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#f4ebe1] flex items-center justify-center text-[#8c7462]">
              <span className="material-symbols-outlined text-sm">bedtime</span>
            </div>
            <h3 className="font-bold text-[#624633]">Target & Preferensi</h3>
          </div>

          <div className="space-y-5 flex-1">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-bold text-gray-500">Target Durasi Tidur Harian</label>
                <span className="text-xs font-bold text-[#8c7462]">12 Jam</span>
              </div>
              <input type="range" min="8" max="16" defaultValue="12" className="w-full accent-[#8c7462]" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>8 Jam</span>
                <span>16 Jam</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-bold text-gray-500">Suhu Kamar Favorit</label>
                <span className="text-xs font-bold text-[#8c7462]">25°C</span>
              </div>
              <input type="range" min="20" max="30" defaultValue="25" className="w-full accent-[#8c7462]" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>20°C</span>
                <span>30°C</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 bg-[#f8f5f1] text-[#8c7462] py-2.5 rounded-xl text-xs font-bold hover:bg-[#e6ceb3]/30 transition-colors border border-[#e6ceb3]/50">
            Simpan Target
          </button>
        </section>

        {/* App Preferences */}
        <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#eef3ea] flex items-center justify-center text-[#667b68]">
              <span className="material-symbols-outlined text-sm">palette</span>
            </div>
            <h3 className="font-bold text-[#624633]">Preferensi Aplikasi</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-[#624633]">Bahasa Aplikasi</p>
                <p className="text-[10px] text-gray-500">Pilih bahasa antarmuka</p>
              </div>
              <select className="bg-white border border-gray-200 text-xs font-bold text-[#8c7462] py-1.5 px-3 rounded-lg focus:outline-none focus:border-[#8c7462]">
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-[#624633]">Notifikasi Push</p>
                <p className="text-[10px] text-gray-500">Terima peringatan langsung</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8c7462]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-[#624633]">Laporan Mingguan</p>
                <p className="text-[10px] text-gray-500">Kirim statistik via Email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8c7462]"></div>
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f8f5f1] flex items-center justify-center text-[#8c7462]">
              <span className="material-symbols-outlined text-sm">history</span>
            </div>
            <h3 className="font-bold text-[#624633]">Aktivitas Terakhir Anda</h3>
          </div>
        </div>

        <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent pl-8 md:pl-0">

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#f8f5f1] text-[#8c7462] absolute left-0 md:left-1/2 -translate-x-1/2 shadow-sm z-10">
              <span className="material-symbols-outlined text-sm">login</span>
            </div>
            <div className="w-full md:w-[calc(50%-2.5rem)] bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm ml-4 md:ml-0 md:group-odd:mr-4 md:group-even:ml-4">
              <p className="text-xs font-bold text-[#624633]">Login Berhasil</p>
              <p className="text-[10px] text-gray-500">Anda masuk ke sistem melalui Chrome (Windows)</p>
              <p className="text-[9px] font-bold text-gray-400 mt-1">Hari ini, 08:30 AM</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#eef3ea] text-[#667b68] absolute left-0 md:left-1/2 -translate-x-1/2 shadow-sm z-10">
              <span className="material-symbols-outlined text-sm">settings_remote</span>
            </div>
            <div className="w-full md:w-[calc(50%-2.5rem)] bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm ml-4 md:ml-0 md:group-odd:mr-4 md:group-even:ml-4">
              <p className="text-xs font-bold text-[#624633]">Mengubah Warna Lampu</p>
              <p className="text-[10px] text-gray-500">Menyetel lampu ke warna Kuning di Kamar Bayi</p>
              <p className="text-[9px] font-bold text-gray-400 mt-1">Kemarin, 20:15 PM</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
