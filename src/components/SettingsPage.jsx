import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function SettingsPage() {
  const { logout } = useAppContext();
  
  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isChangeWifiOpen, setIsChangeWifiOpen] = useState(false);

  // Form states
  const [userRole, setUserRole] = useState('Admin');

  // State for Dropdown and Action Modals
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  // Dummy Data
  const usersList = [
    { id: 'u1', name: 'Budi Darmawan', role: 'ADMIN', email: 'budi.darmawan@email.com', initials: 'BD', color: 'bg-[#eef3ea] text-[#667b68]' },
    { id: 'u2', name: 'Ani Septiani', role: 'ANGGOTA', email: 'ani.septiani@email.com', initials: 'AS', color: 'bg-[#f4f5f0] text-[#8c7462]' },
    { id: 'u3', name: 'Rizky Pratama', role: 'ANGGOTA', email: 'rizky.p@email.com', initials: 'RP', color: 'bg-[#f4f5f0] text-[#8c7462]' },
  ];

  const devicesList = [
    { id: 'd1', name: 'SleepWell Hub - Main Bedroom', status: 'Online', icon: 'router', color: 'bg-[#e6ceb3]/30 text-[#8c7462]' },
    { id: 'd2', name: 'SleepWell Light - Nursery', status: 'Offline', icon: 'lightbulb', color: 'bg-red-100 text-red-400' },
  ];

  const handleAction = (action, item) => {
    setActionTarget(item);
    setOpenDropdownId(null);
    if (action === 'edit') setIsEditModalOpen(true);
    if (action === 'delete') setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-8 animate-fade-in relative" onClick={() => setOpenDropdownId(null)}>
      
      {/* Header Pengaturan */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#624633] mb-1">Pengaturan</h2>
        <p className="text-sm text-gray-500">Kelola akun Anda dan konfigurasi perangkat SleepWell.</p>
      </div>

      {/* PENGELOLAAN PENGGUNA */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-[#8c7462] tracking-wider uppercase">PENGELOLAAN PENGGUNA</h3>
          <button 
            onClick={() => setIsAddUserOpen(true)}
            className="bg-[#8c7462] text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-[#735d4d] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Tambah Anggota
          </button>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-visible flex flex-col gap-[1px] bg-gray-100/50">
          {usersList.map((user) => (
            <div key={user.id} className="bg-white p-4 flex items-center justify-between hover:bg-gray-50 transition-colors relative first:rounded-t-3xl last:rounded-b-3xl">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${user.color}`}>
                  {user.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#624633] text-sm">{user.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${user.color}`}>{user.role}</span>
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === user.id ? null : user.id); }} 
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                
                {/* Dropdown Menu */}
                {openDropdownId === user.id && (
                  <div className="absolute right-0 top-10 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-fade-in">
                    <button onClick={() => handleAction('edit', user)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f5f1] flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-[#8c7462]">edit</span> Edit
                    </button>
                    <button onClick={() => handleAction('delete', user)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[16px]">delete</span> Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANAJEMEN PERANGKAT */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-[#8c7462] tracking-wider uppercase">MANAJEMEN PERANGKAT</h3>
          <button 
            onClick={() => setIsAddDeviceOpen(true)}
            className="bg-[#8c7462] text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-[#735d4d] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Tambah Perangkat
          </button>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-visible flex flex-col gap-[1px] bg-gray-100/50">
          {devicesList.map((device) => (
            <div key={device.id} className="bg-white p-4 flex items-center justify-between hover:bg-gray-50 transition-colors relative first:rounded-t-3xl last:rounded-b-3xl">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${device.color}`}>
                  <span className="material-symbols-outlined">{device.icon}</span>
                </div>
                <div>
                  <span className="font-bold text-[#624633] text-sm block">{device.name}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'Online' ? 'bg-[#667b68]' : 'bg-gray-300'}`}></span>
                    <p className="text-[10px] text-gray-500 font-medium">{device.status}</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === device.id ? null : device.id); }} 
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>

                {/* Dropdown Menu */}
                {openDropdownId === device.id && (
                  <div className="absolute right-0 top-10 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-fade-in">
                    <button onClick={() => handleAction('edit', device)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f5f1] flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-[#8c7462]">settings</span> Config
                    </button>
                    <button onClick={() => handleAction('delete', device)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[16px]">link_off</span> Putus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JARINGAN WIFI */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#eef3ea] flex items-center justify-center text-[#667b68]">
              <span className="material-symbols-outlined">wifi</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Jaringan Terhubung</p>
              <h4 className="font-bold text-[#624633] text-sm">Nursery_Home_5G</h4>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="material-symbols-outlined text-[#667b68] text-lg">signal_wifi_4_bar</span>
            <p className="text-[10px] text-gray-400 mt-1">Sangat Kuat</p>
          </div>
        </div>

        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex gap-3 items-start mb-5">
          <span className="material-symbols-outlined text-[#8c7462] text-sm mt-0.5">info</span>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Perangkat Anda terhubung melalui frekuensi 5GHz untuk latensi kontrol lampu yang lebih rendah.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsChangeWifiOpen(true)}
            className="flex-1 bg-[#5c6b54] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a5743] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">sync</span> Ganti Jaringan
          </button>
          <button className="flex-1 bg-white text-red-500 border border-red-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">wifi_off</span> Lupakan Jaringan
          </button>
        </div>
      </div>

      {/* LAINNYA */}
      <div>
        <h3 className="text-xs font-bold text-[#8c7462] tracking-wider uppercase mb-4">LAINNYA</h3>
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col gap-[1px] bg-gray-100/50">
          
          <button className="w-full bg-white p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3 text-[#624633] font-medium text-sm">
              <span className="material-symbols-outlined text-gray-400">help</span>
              Pusat Bantuan
            </div>
            <span className="material-symbols-outlined text-gray-300 text-sm">arrow_forward_ios</span>
          </button>

          <button onClick={logout} className="w-full bg-white p-4 flex items-center justify-between hover:bg-red-50 transition-colors text-left group">
            <div className="flex items-center gap-3 text-red-500 font-medium text-sm">
              <span className="material-symbols-outlined text-red-400 group-hover:text-red-500">logout</span>
              Keluar dari Akun
            </div>
            <span className="material-symbols-outlined text-gray-300 text-sm group-hover:text-red-300">arrow_forward_ios</span>
          </button>

        </div>
      </div>

      {/* MODAL: TAMBAH ANGGOTA */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#e6eed8]/40 backdrop-blur-sm" onClick={() => setIsAddUserOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] p-8 text-center relative z-10 animate-fade-in">
            <div className="w-16 h-16 bg-[#f8f5f1] text-[#8c7462] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">person_add</span>
            </div>
            <h2 className="text-xl font-bold text-[#624633] mb-1">Tambah Anggota</h2>
            <p className="text-xs text-gray-500 mb-6">Buat akun baru dengan memasukkan username dan password.</p>
            
            <form className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-lg">person</span>
                  </div>
                  <input type="text" placeholder="Masukkan username" className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-lg">lock</span>
                  </div>
                  <input type="password" placeholder="Masukkan password" className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1">Peran Pengguna</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setUserRole('Admin')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${userRole === 'Admin' ? 'bg-[#f4ebe1] border-[#d8a878] text-[#8c7462]' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    Admin
                  </button>
                  <button 
                    type="button"
                    onClick={() => setUserRole('Anggota')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${userRole === 'Anggota' ? 'bg-[#f4ebe1] border-[#d8a878] text-[#8c7462]' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    Anggota
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-[#8c7462] text-white py-2.5 rounded-full text-sm font-bold hover:bg-[#735d4d]">Tambah Anggota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PERANGKAT */}
      {isAddDeviceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsAddDeviceOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[480px] p-8 relative z-10 animate-fade-in">
            <h2 className="text-xl font-bold text-[#624633] mb-1">Tambah Perangkat Baru</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">Masukkan detail perangkat SleepWell Anda untuk mulai menghubungkannya.</p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-1">Nama Perangkat</label>
                <input type="text" placeholder="misal: Lampu Kamar Utama" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-1">ID Perangkat</label>
                <input type="text" placeholder="nomor seri atau ID unik" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-1">Password Perangkat</label>
                <input type="password" placeholder="Masukkan password" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setIsAddDeviceOpen(false)} className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50">Batal</button>
                <button type="submit" className="bg-[#8c7462] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#735d4d]">Hubungkan Perangkat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GANTI JARINGAN */}
      {isChangeWifiOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsChangeWifiOpen(false)}></div>
          
          <div className="bg-[#faf9f8] rounded-3xl shadow-2xl w-full max-w-[500px] max-h-[85vh] flex flex-col relative z-10 animate-fade-in overflow-hidden">
            
            {/* Header Popup */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8c7462]">wifi_find</span>
                <h2 className="text-lg font-bold text-[#624633]">Ganti Jaringan Wi-Fi</h2>
              </div>
              <button onClick={() => setIsChangeWifiOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-xs text-gray-500 mb-6">Pilih jaringan Wi-Fi baru untuk menghubungkan perangkat SleepWell Anda ke internet.</p>

              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Jaringan Saat Ini</h3>
              <div className="bg-[#f4ebe1]/50 border border-[#e6ceb3]/50 rounded-2xl p-4 flex items-center justify-between mb-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d8a878] flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined">wifi</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#624633] text-sm">Home_Network_5G</h4>
                    <p className="text-[10px] text-[#8c7462] font-semibold mt-0.5">Tersambung saat ini</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#8c7462]">check_circle</span>
              </div>

              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Jaringan Tersedia</h3>
              <div className="space-y-3">
                
                {/* Active Item to enter password */}
                <div className="bg-white border border-[#e6ceb3] rounded-2xl p-4 shadow-sm ring-2 ring-[#f4ebe1]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f8f5f1] flex items-center justify-center text-[#8c7462]">
                        <span className="material-symbols-outlined text-sm">wifi</span>
                      </div>
                      <span className="font-bold text-[#624633] text-sm">Guest_WIFI</span>
                    </div>
                    <span className="material-symbols-outlined text-[#8c7462] text-sm">lock</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8c7462] mb-1.5 ml-1">Password Jaringan</label>
                    <div className="relative mb-4">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 text-sm">key</span>
                      </div>
                      <input type="password" placeholder="Masukkan password..." className="w-full bg-[#fdfbf7] border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462] focus:ring-1 focus:ring-[#8c7462] transition-all" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                        <span className="material-symbols-outlined text-gray-400 text-lg hover:text-gray-600">visibility_off</span>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button className="bg-white border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">Batal</button>
                      <button className="bg-[#8c7462] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#735d4d] transition-colors shadow-sm">Hubungkan</button>
                    </div>
                  </div>
                </div>

                {/* Inactive Items */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-gray-300 cursor-pointer transition-all shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#f8f5f1] group-hover:text-[#8c7462] transition-colors">
                      <span className="material-symbols-outlined text-sm">wifi</span>
                    </div>
                    <span className="font-semibold text-gray-600 text-sm group-hover:text-[#624633] transition-colors">Neighbors_WIFI</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 text-sm">lock</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-gray-300 cursor-pointer transition-all shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#f8f5f1] group-hover:text-[#8c7462] transition-colors">
                      <span className="material-symbols-outlined text-sm">wifi</span>
                    </div>
                    <span className="font-semibold text-gray-600 text-sm group-hover:text-[#624633] transition-colors">Free_Public_WIFI</span>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL: EDIT (PENGGUNA / PERANGKAT) */}
      {isEditModalOpen && actionTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] p-8 relative z-10 animate-fade-in">
            <h2 className="text-xl font-bold text-[#624633] mb-1">
              {actionTarget.email ? 'Edit Anggota' : 'Konfigurasi Perangkat'}
            </h2>
            <p className="text-xs text-gray-500 mb-6">Ubah data untuk {actionTarget.name}.</p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-1">Nama</label>
                <input type="text" defaultValue={actionTarget.name} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
              </div>
              {actionTarget.email && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-1">Password Baru (Opsional)</label>
                  <input type="password" placeholder="Kosongkan jika tidak ingin mengubah" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
                </div>
              )}
              {!actionTarget.email && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 ml-1">Lokasi Ruangan</label>
                  <input type="text" defaultValue="Main Bedroom" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#8c7462]" />
                </div>
              )}
              
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50">Batal</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-[#8c7462] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#735d4d]">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS KONFIRMASI */}
      {isDeleteModalOpen && actionTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] p-8 text-center relative z-10 animate-fade-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h2 className="text-xl font-bold text-[#624633] mb-2">Konfirmasi Hapus</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-red-500">{actionTarget.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50">Batal</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 shadow-sm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
