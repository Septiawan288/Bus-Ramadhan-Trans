let buses = [
    { id: 1, plat_nomor: 'B 1234 CD', merk_bus: 'Mercedes-Benz', kapasitas: 40, img_url: '' },
    { id: 2, plat_nomor: 'AB 5678 EF', merk_bus: 'Scania', kapasitas: 35, img_url: '' },
    { id: 3, plat_nomor: 'D 9999 GH', merk_bus: 'Hino', kapasitas: 50, img_url: '' }
];

let routes = [
    { id: 101, asal: 'Jakarta', tujuan: 'Surabaya', jarak_km: 800 },
    { id: 102, asal: 'Bandung', tujuan: 'Yogyakarta', jarak_km: 450 },
    { id: 103, asal: 'Surabaya', tujuan: 'Bali', jarak_km: 400 },
    { id: 104, asal: 'Pekanbaru', tujuan: 'Medan', jarak_km: 600 },
    { id: 105, asal: 'Medan', tujuan: 'Pekanbaru', jarak_km: 600 }
];

let schedules = [
    { id: 1001, id_bus: 1, id_rute: 101, tanggal: '2025-07-15', waktu_berangkat: '08:00', harga_tiket: 250000, harga_anak_persen: 0.75 },
    { id: 1002, id_bus: 2, id_rute: 102, tanggal: '2025-07-16', waktu_berangkat: '09:30', harga_tiket: 180000, harga_anak_persen: 0.8 },
    { id: 1003, id_bus: 1, id_rute: 102, tanggal: '2025-07-15', waktu_berangkat: '14:00', harga_tiket: 200000, harga_anak_persen: 0.8 },
    { id: 1004, id_bus: 3, id_rute: 103, tanggal: '2025-07-17', waktu_berangkat: '10:00', harga_tiket: 150000, harga_anak_persen: 0.7 },
    { id: 1005, id_bus: 2, id_rute: 104, tanggal: '2025-07-18', waktu_berangkat: '20:00', harga_tiket: 220000, harga_anak_persen: 0.75 },
    { id: 1006, id_bus: 3, id_rute: 105, tanggal: '2025-07-08', waktu_berangkat: '12:00', harga_tiket: 200000, harga_anak_persen: 0.7 }
];

let seatAvailability = {
    "1001": [],
    "1002": [],
    "1003": [],
    "1004": [],
    "1005": [],
    "1006": []
};

let customers = [];
let bookings = [];

let selectedScheduleId = null;
let selectedSeats = [];

const asalInput = document.getElementById('asal');
const tujuanInput = document.getElementById('tujuan');
const tanggalInput = document.getElementById('tanggal');
const searchBtn = document.getElementById('searchBtn');
const jadwalList = document.getElementById('jadwalList');

const namaPelangganInput = document.getElementById('namaPelanggan');
const emailPelangganInput = document.getElementById('emailPelanggan');
const noTelpPelangganInput = document.getElementById('noTelpPelanggan');
const pilihJadwalInput = document.getElementById('pilihJadwal');
const bookBtn = document.getElementById('bookBtn');
const messageArea = document.getElementById('messageArea');

const jumlahDewasaInput = document.getElementById('jumlahDewasa');
const jumlahAnakInput = document.getElementById('jumlahAnak');
const deskripsiPaketInput = document.getElementById('deskripsiPaket');
const beratPaketInput = document.getElementById('beratPaket');

const paymentCashRadio = document.getElementById('paymentCash'); 

const seatSelectionArea = document.getElementById('seatSelectionArea');
const seatMap = document.getElementById('seatMap');
const selectJadwalHint = seatSelectionArea.querySelector('.select-jadwal-hint');
const jadwalOptionsDatalist = document.getElementById('jadwalOptions');

const summaryJadwal = document.getElementById('summaryJadwal');
const summaryPenumpang = document.getElementById('summaryPenumpang');
const summaryKursi = document.getElementById('summaryKursi');
const summaryPaket = document.getElementById('summaryPaket');
const summaryTotalHarga = document.getElementById('summaryTotalHarga');

const confirmationModal = document.getElementById('confirmationModal');
const modalSummary = document.getElementById('modalSummary');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');
const cancelBookingBtn = document.getElementById('cancelBookingBtn');
const closeButton = document.querySelector('.close-button');

const bookingHistoryList = document.getElementById('bookingHistoryList');

let currentBookingData = null;

function initializeSeats() {
    schedules.forEach(schedule => {
        const bus = buses.find(b => b.id === schedule.id_bus);
        if (bus) {
            seatAvailability[`${schedule.id}`] = [];
            for (let i = 1; i <= bus.kapasitas; i++) {
                seatAvailability[`${schedule.id}`].push({
                    number: `A${i}`,
                    status: 'Tersedia'
                });
            }
        }
    });
    if (seatAvailability['1001']) {
        seatAvailability['1001'][0].status = 'Terisi';
        seatAvailability['1001'][1].status = 'Terisi';
    }
    if (seatAvailability['1002']) {
        seatAvailability['1002'][5].status = 'Terisi';
    }
    if (seatAvailability['1006']) {
        seatAvailability['1006'][0].status = 'Terisi';
    }
}

function setInitialDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    tanggalInput.value = `${year}-${month}-${day}`;
}

function clearJadwalList() {
    jadwalList.innerHTML = '<p class="empty-state">Tidak ada jadwal yang ditemukan. Silakan lakukan pencarian.</p>';
}

function displayMessage(message, type) {
    messageArea.textContent = '';
    messageArea.className = `message-area ${type} visible`;
    typeWriter(message, messageArea, 0);

    setTimeout(() => {
        messageArea.className = 'message-area';
        setTimeout(() => messageArea.textContent = '', 400);
    }, 6000);
}

function typeWriter(text, element, i) {
    if (i < text.length) {
        element.textContent += text.charAt(i);
        setTimeout(() => typeWriter(text, element, i + 1), 50);
    }
}

function calculateTotalPrice(schedule, numAdults, numChildren) {
    const hargaDewasa = schedule.harga_tiket;
    const hargaAnak = schedule.harga_tiket * (schedule.harga_anak_persen || 1);
    return (numAdults * hargaDewasa) + (numChildren * hargaAnak);
}

function updateBookingSummary() {
    const numDewasa = parseInt(jumlahDewasaInput.value) || 0;
    const numAnak = parseInt(jumlahAnakInput.value) || 0;
    const totalPenumpang = numDewasa + numAnak;

    if (selectedScheduleId && totalPenumpang > 0 && selectedSeats.length === totalPenumpang) {
        const schedule = schedules.find(s => s.id === selectedScheduleId);
        if (schedule) {
            const totalHarga = calculateTotalPrice(schedule, numDewasa, numAnak);
            const route = routes.find(r => r.id === schedule.id_rute);
            const deskripsiPaket = deskripsiPaketInput.value.trim();
            const beratPaket = parseFloat(beratPaketInput.value) || 0;
            const paketInfo = (deskripsiPaket && beratPaket > 0) ? `${deskripsiPaket} (${beratPaket} kg)` : 'Tidak ada';

            summaryJadwal.textContent = `${route.asal} - ${route.tujuan} (${schedule.tanggal} ${schedule.waktu_berangkat})`;
            summaryPenumpang.textContent = `${numDewasa} Dewasa, ${numAnak} Anak`;
            summaryKursi.textContent = selectedSeats.map(seat => seat.number).join(', ');
            summaryPaket.textContent = paketInfo;
            summaryTotalHarga.textContent = `Rp ${totalHarga.toLocaleString('id-ID')}`;
            return true;
        }
    }
    summaryJadwal.textContent = '-';
    summaryPenumpang.textContent = '-';
    summaryKursi.textContent = '-';
    summaryPaket.textContent = '-';
    summaryTotalHarga.textContent = '-';
    return false;
}

function resetSeatSelection() {
    selectedScheduleId = null;
    selectedSeats = [];
    pilihJadwalInput.value = '';
    seatMap.innerHTML = '';
    selectJadwalHint.style.display = 'block';
    updateBookingSummary();
}

function populateJadwalDatalist() {
    jadwalOptionsDatalist.innerHTML = '';
    schedules.forEach(schedule => {
        const route = routes.find(r => r.id === schedule.id_rute);
        if (route) {
            const option = document.createElement('option');
            option.value = schedule.id;
            option.textContent = `ID: ${schedule.id} - ${route.asal} ke ${route.tujuan} (${schedule.tanggal} ${schedule.waktu_berangkat})`;
            jadwalOptionsDatalist.appendChild(option);
        }
    });
}

function showConfirmationModal(bookingDetails) {
    modalSummary.innerHTML = `
        <p><strong>Nama:</strong> <span>${bookingDetails.customer.nama_lengkap}</span></p>
        <p><strong>Email:</strong> <span>${bookingDetails.customer.email}</span></p>
        <p><strong>Telepon:</strong> <span>${bookingDetails.customer.nomor_telepon}</span></p>
        <p><strong>Jadwal:</strong> <span>${bookingDetails.jadwalInfo}</span></p>
        <p><strong>Penumpang:</strong> <span>${bookingDetails.jumlahDewasa} Dewasa, ${bookingDetails.jumlahAnak} Anak</span></p>
        <p><strong>Kursi Dipilih:</strong> <span>${bookingDetails.kursi_dipilih.join(', ')}</span></p>
        <p><strong>Barang/Paket:</strong> <span>${bookingDetails.paketInfo}</span></p>
        <p><strong>Metode Pembayaran:</strong> <span>${bookingDetails.metode_pembayaran}</span></p>
        <p class="total-price-summary"><strong>Total Harga:</strong> <span>Rp ${bookingDetails.total_harga.toLocaleString('id-ID')}</span></p>
    `;
    confirmationModal.classList.add('show');
}

function hideConfirmationModal() {
    confirmationModal.classList.remove('show');
    currentBookingData = null;
}

function displayBookingHistory() {
    bookingHistoryList.innerHTML = '';

    if (bookings.length === 0) {
        bookingHistoryList.innerHTML = '<p class="empty-state">Belum ada pemesanan yang berhasil.</p>';
        return;
    }

    const sortedBookings = [...bookings].reverse();

    sortedBookings.forEach(booking => {
        const customer = customers.find(c => c.id === booking.id_pelanggan);
        const schedule = schedules.find(s => s.id === booking.id_jadwal);
        const route = schedule ? routes.find(r => r.id === schedule.id_rute) : null;
        // const bus = schedule ? buses.find(b => b.id === schedule.id_bus) : null; // Bus objek tidak digunakan untuk tampilan gambar

        let statusColor = '';
        switch (booking.status_pesanan) {
            case 'Lunas':
                statusColor = 'green';
                break;
            case 'Dibatalkan':
                statusColor = 'red';
                break;
            default:
                statusColor = 'gray';
        }

        const bookingDate = schedule ? new Date(schedule.tanggal) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const showCancelButton = (booking.status_pesanan === 'Lunas' && bookingDate && bookingDate >= today);
        
        const card = document.createElement('div');
        card.className = 'card-item';
        card.innerHTML = `
            <div class="booking-item-header">
                <h3>Pemesanan ID: ${booking.id_pemesanan}</h3>
                <p><strong>Tanggal Pesan:</strong> ${booking.tanggal_pesan}</p>
            </div>
            
            <div class="booking-bus-info">
                <p><strong>Bus:</strong> ${schedule && buses.find(b=>b.id === schedule.id_bus) ? `${buses.find(b=>b.id === schedule.id_bus).merk_bus} (${buses.find(b=>b.id === schedule.id_bus).plat_nomor})` : 'N/A'}</p>
                <p><strong>Jadwal:</strong> ${route ? `${route.asal} &rarr; ${route.tujuan} (${schedule.tanggal} ${schedule.waktu_berangkat})` : 'N/A'}</p>
            </div>

            <div class="booking-details">
                <p><strong>Pelanggan:</strong> ${customer ? customer.nama_lengkap : 'N/A'}</p>
                <p><strong>Penumpang:</strong> ${booking.jumlah_dewasa} Dewasa, ${booking.jumlah_anak} Anak</p>
                <p><strong>Kursi:</strong> ${booking.kursi_dipilih.join(', ')}</p>
                <p><strong>Paket:</strong> ${booking.deskripsi_paket && booking.berat_paket > 0 ? `${booking.deskripsi_paket} (${booking.berat_paket} kg)` : 'Tidak ada'}</p>
                <p><strong>Metode Bayar:</strong> ${booking.metode_pembayaran}</p>
                <p><strong>Total Harga:</strong> <span style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--success-color')}; font-weight: bold;">Rp ${booking.total_harga.toLocaleString('id-ID')}</span></p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${booking.status_pesanan}</span></p>
            </div>
            
            ${showCancelButton ? 
                `<button class="btn btn-secondary cancel-booking-btn" data-booking-id="${booking.id_pemesanan}">Batalkan</button>` 
                : ''}
        `;
        bookingHistoryList.appendChild(card);
    });

    document.querySelectorAll('.cancel-booking-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const bookingIdToCancel = parseInt(event.target.dataset.bookingId);
            if (confirm(`Apakah Anda yakin ingin membatalkan pemesanan ID ${bookingIdToCancel}?`)) {
                cancelBooking(bookingIdToCancel);
            }
        });
    });
}

function cancelBooking(bookingId) {
    const bookingIndex = bookings.findIndex(b => b.id_pemesanan === bookingId);

    if (bookingIndex !== -1) {
        const bookingToCancel = bookings[bookingIndex];

        if (bookingToCancel.status_pesanan === 'Lunas') {
            bookingToCancel.status_pesanan = 'Dibatalkan';

            const scheduleId = bookingToCancel.id_jadwal;
            bookingToCancel.kursi_dipilih.forEach(seatNumber => {
                const seat = seatAvailability[`${scheduleId}`].find(s => s.number === seatNumber);
                if (seat) {
                    seat.status = 'Tersedia';
                }
            });

            displayMessage(`Pemesanan ID ${bookingId} berhasil dibatalkan. Kursi telah dikosongkan.`, 'success');
            displayBookingHistory();
            
            const currentAsal = asalInput.value.trim();
            const currentTujuan = tujuanInput.value.trim();
            const currentTanggal = tanggalInput.value;
            if (currentAsal && currentTujuan && currentTanggal) {
                searchBtn.click();
            }
            if (selectedScheduleId === scheduleId) {
                renderSeatMap(selectedScheduleId);
            }

        } else {
            displayMessage(`Pemesanan ID ${bookingId} tidak dapat dibatalkan karena statusnya bukan 'Lunas'.`, 'error');
        }
    } else {
        displayMessage(`Pemesanan ID ${bookingId} tidak ditemukan.`, 'error');
    }
}


searchBtn.addEventListener('click', () => {
    const asal = asalInput.value.trim();
    const tujuan = tujuanInput.value.trim();
    const tanggal = tanggalInput.value;

    if (!asal || !tujuan || !tanggal) {
        displayMessage('Harap lengkapi semua kolom pencarian.', 'error');
        return;
    }

    const filteredSchedules = schedules.filter(schedule => {
        const route = routes.find(r => r.id === schedule.id_rute);
        return route &&
               route.asal.toLowerCase() === asal.toLowerCase() &&
               route.tujuan.toLowerCase() === tujuan.toLowerCase() &&
               schedule.tanggal === tanggal;
    });

    displayJadwal(filteredSchedules);
    resetSeatSelection();
});

pilihJadwalInput.addEventListener('input', () => {
    const id = parseInt(pilihJadwalInput.value);
    const schedule = schedules.find(s => s.id === id);

    if (schedule) {
        selectedScheduleId = id;
        selectedSeats = [];
        renderSeatMap(id);
        selectJadwalHint.style.display = 'none';
    } else {
        resetSeatSelection();
        if (pilihJadwalInput.value !== '') {
            displayMessage('ID Jadwal tidak ditemukan.', 'error');
        }
    }
    updateBookingSummary();
});

jumlahDewasaInput.addEventListener('input', () => {
    selectedSeats = [];
    updateBookingSummary();
    const totalPassengers = parseInt(jumlahDewasaInput.value) + parseInt(jumlahAnakInput.value);
    if (totalPassengers > 0 && selectedScheduleId) {
        renderSeatMap(selectedScheduleId);
    } else if (totalPassengers === 0) {
        displayMessage('Jumlah penumpang tidak boleh nol.', 'error');
    }
});

jumlahAnakInput.addEventListener('input', () => {
    selectedSeats = [];
    updateBookingSummary();
    const totalPassengers = parseInt(jumlahDewasaInput.value) + parseInt(jumlahAnakInput.value);
    if (totalPassengers > 0 && selectedScheduleId) {
        renderSeatMap(selectedScheduleId);
    } else if (totalPassengers === 0) {
        displayMessage('Jumlah penumpang tidak boleh nol.', 'error');
    }
});

deskripsiPaketInput.addEventListener('input', updateBookingSummary);
beratPaketInput.addEventListener('input', updateBookingSummary);

seatMap.addEventListener('click', (event) => {
    const clickedSeat = event.target;
    if (clickedSeat.classList.contains('seat') && selectedScheduleId) {
        const seatNumber = clickedSeat.dataset.seatNumber;
        const seat = seatAvailability[`${selectedScheduleId}`].find(s => s.number === seatNumber);

        const numDewasa = parseInt(jumlahDewasaInput.value) || 0;
        const numAnak = parseInt(jumlahAnakInput.value) || 0;
        const totalRequiredSeats = numDewasa + numAnak;

        if (totalRequiredSeats === 0) {
            displayMessage('Harap masukkan jumlah penumpang (dewasa/anak) terlebih dahulu.', 'error');
            return;
        }

        if (seat && seat.status === 'Tersedia') {
            const isSelected = selectedSeats.some(s => s.number === seat.number);

            if (isSelected) {
                selectedSeats = selectedSeats.filter(s => s.number !== seatNumber);
                clickedSeat.classList.remove('selected');
            } else {
                if (selectedSeats.length < totalRequiredSeats) {
                    selectedSeats.push(seat);
                    clickedSeat.classList.add('selected');
                } else {
                    displayMessage(`Anda hanya bisa memilih ${totalRequiredSeats} kursi (sesuai jumlah jumlah penumpang).`, 'error');
                }
            }
            updateBookingSummary();
        } else if (seat && seat.status === 'Terisi') {
            displayMessage(`Kursi ${seatNumber} sudah terisi.`, 'error');
        }
    }
});

bookBtn.addEventListener('click', () => {
    const namaPelanggan = namaPelangganInput.value.trim();
    const emailPelanggan = emailPelangganInput.value.trim();
    const noTelpPelanggan = noTelpPelangganInput.value.trim();
    const numDewasa = parseInt(jumlahDewasaInput.value) || 0;
    const numAnak = parseInt(jumlahAnakInput.value) || 0;
    const totalPenumpang = numDewasa + numAnak;
    const deskripsiPaket = deskripsiPaketInput.value.trim();
    const beratPaket = parseFloat(beratPaketInput.value) || 0;

    const selectedPaymentMethod = 'Cash';

    if (!namaPelanggan || !emailPelanggan || !noTelpPelanggan) {
        displayMessage('Harap lengkapi detail pelanggan (Nama, Email, Telepon).', 'error');
        return;
    }

    if (totalPenumpang === 0) {
        displayMessage('Jumlah penumpang tidak boleh nol. Masukkan setidaknya 1 penumpang.', 'error');
        return;
    }

    if (!selectedScheduleId) {
        displayMessage('Harap pilih jadwal bus terlebih dahulu.', 'error');
        return;
    }

    if (selectedSeats.length === 0) {
        displayMessage('Harap pilih kursi untuk penumpang Anda.', 'error');
        return;
    }

    if (selectedSeats.length !== totalPenumpang) {
        displayMessage('Jumlah kursi yang dipilih harus sama dengan total jumlah penumpang.', 'error');
        return;
    }

    if (!isValidEmail(emailPelanggan)) {
        displayMessage('Format email tidak valid.', 'error');
        return;
    }

    if (!isValidPhoneNumber(noTelpPelanggan)) {
        displayMessage('Format nomor telepon tidak valid. Gunakan hanya angka dan mungkin tanda "+".', 'error');
        return;
    }

    const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);
    if (!selectedSchedule) {
        displayMessage('Jadwal tidak ditemukan. Mohon ulangi pencarian.', 'error');
        return;
    }

    let customer = customers.find(c => c.email === emailPelanggan);
    if (!customer) {
        const newCustomerId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        customer = {
            id: newCustomerId,
            nama_lengkap: namaPelanggan,
            email: emailPelanggan,
            nomor_telepon: noTelpPelanggan
        };
        customers.push(customer);
    }

    const totalHarga = calculateTotalPrice(selectedSchedule, numDewasa, numAnak);
    const tanggalPesan = new Date().toISOString().slice(0, 10);
    const paketInfo = (deskripsiPaket && beratPaket > 0) ? `${deskripsiPaket} (${beratPaket} kg)` : 'Tidak ada';
    const routeInfo = routes.find(r => r.id === selectedSchedule.id_rute);
    const jadwalInfo = `${selectedSchedule.tanggal} ${selectedSchedule.waktu_berangkat} (${routeInfo.asal} - ${routeInfo.tujuan})`;

    currentBookingData = {
        customer: customer,
        id_jadwal: selectedScheduleId,
        jadwalInfo: jadwalInfo,
        kursi_dipilih: selectedSeats.map(s => s.number),
        tanggal_pesan: tanggalPesan,
        jumlahDewasa: numDewasa,
        jumlahAnak: numAnak,
        deskripsi_paket: deskripsiPaket,
        berat_paket: beratPaket,
        paketInfo: paketInfo,
        total_harga: totalHarga,
        metode_pembayaran: selectedPaymentMethod,
        status_pesanan: 'Lunas'
    };

    showConfirmationModal(currentBookingData);
});

confirmBookingBtn.addEventListener('click', () => {
    if (!currentBookingData) {
        displayMessage('Data pemesanan tidak ditemukan. Mohon coba lagi.', 'error');
        hideConfirmationModal();
        return;
    }

    currentBookingData.kursi_dipilih.forEach(seatNumber => {
        const seatInAvailability = seatAvailability[`${currentBookingData.id_jadwal}`].find(s => s.number === seatNumber);
        if (seatInAvailability) {
            seatInAvailability.status = 'Terisi';
        }
    });

    const newBookingId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id_pemesanan)) + 1 : 1;
    const finalBooking = {
        id_pemesanan: newBookingId,
        id_pelanggan: currentBookingData.customer.id,
        id_jadwal: currentBookingData.id_jadwal,
        kursi_dipilih: currentBookingData.kursi_dipilih,
        tanggal_pesan: currentBookingData.tanggal_pesan,
        jumlah_dewasa: currentBookingData.jumlahDewasa,
        jumlah_anak: currentBookingData.jumlahAnak,
        deskripsi_paket: currentBookingData.deskripsi_paket,
        berat_paket: currentBookingData.berat_paket,
        total_harga: currentBookingData.total_harga,
        metode_pembayaran: currentBookingData.metode_pembayaran,
        status_pesanan: 'Lunas'
    };
    bookings.push(finalBooking);

    displayMessage(`Pemesanan berhasil dikonfirmasi! ID: ${finalBooking.id_pemesanan}. Selamat jalan!`, 'success');

    const currentAsal = asalInput.value.trim();
    const currentTujuan = tujuanInput.value.trim();
    const currentTanggal = tanggalInput.value;
    if (currentAsal && currentTujuan && currentTanggal) {
        searchBtn.click();
    } else {
        clearJadwalList();
    }
    resetSeatSelection();

    namaPelangganInput.value = '';
    emailPelangganInput.value = '';
    noTelpPelangganInput.value = '';
    jumlahDewasaInput.value = '1';
    jumlahAnakInput.value = '0';
    deskripsiPaketInput.value = '';
    beratPaketInput.value = '0';

    hideConfirmationModal();
    displayBookingHistory();
});

cancelBookingBtn.addEventListener('click', () => {
    hideConfirmationModal();
    displayMessage('Pemesanan dibatalkan.', 'info');
});

closeButton.addEventListener('click', () => {
    hideConfirmationModal();
});
window.addEventListener('click', (event) => {
    if (event.target == confirmationModal) {
        hideConfirmationModal();
    }
});

function displayJadwal(jadwalArray) {
    jadwalList.innerHTML = '';

    if (jadwalArray.length === 0) {
        jadwalList.innerHTML = '<p class="empty-state">Tidak ada jadwal bus yang tersedia untuk kriteria tersebut.</p>';
        return;
    }

    jadwalArray.forEach(schedule => {
        const bus = buses.find(b => b.id === schedule.id_bus);
        const route = routes.find(r => r.id === schedule.id_rute);
        const availableSeatsCount = seatAvailability[`${schedule.id}`] ? seatAvailability[`${schedule.id}`].filter(seat => seat.status === 'Tersedia').length : 0;

        if (bus && route) {
            const card = document.createElement('div');
            card.className = 'card-item';
            card.innerHTML = `
                <h3>ID Jadwal: ${schedule.id}</h3>
                <p><strong>Bus:</strong> ${bus.merk_bus} (${bus.plat_nomor})</p>
                <p><strong>Rute:</strong> ${route.asal} &rarr; ${route.tujuan}</p>
                <p><strong>Tanggal:</strong> ${schedule.tanggal} | <strong>Waktu:</strong> ${schedule.waktu_berangkat}</p>
                <p><strong>Harga Tiket Dewasa:</strong> <span style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')}">Rp ${schedule.harga_tiket.toLocaleString('id-ID')}</span></p>
                <p><strong>Harga Tiket Anak:</strong> <span style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--info-color')}">Rp ${(schedule.harga_tiket * (schedule.harga_anak_persen || 1)).toLocaleString('id-ID')}</span></p>
                <p><strong>Kursi Tersedia:</strong> <span style="font-weight: bold; color: ${availableSeatsCount > 5 ? '#28a745' : (availableSeatsCount > 0 ? '#ffc107' : '#dc3545')}">${availableSeatsCount}</span> dari ${bus.kapasitas}</p>
            `;
            jadwalList.appendChild(card);
        }
    });
}

function renderSeatMap(scheduleId) {
    seatMap.innerHTML = '';
    const seats = seatAvailability[`${scheduleId}`];

    if (!seats || seats.length === 0) {
        seatMap.innerHTML = '<p class="empty-state">Tidak ada informasi kursi untuk jadwal ini.</p>';
        return;
    }

    seats.forEach(seat => {
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');
        seatElement.classList.add(seat.status.toLowerCase());

        if (selectedSeats.some(s => s.number === seat.number)) {
            seatElement.classList.add('selected');
        }

        seatElement.dataset.seatNumber = seat.number;
        seatElement.textContent = seat.number;
        seatMap.appendChild(seatElement);
    });
}

function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isValidPhoneNumber(phone) {
    const re = /^[+]?[\d\s-]{8,15}$/;
    return re.test(String(phone));
}

initializeSeats();
setInitialDate();
clearJadwalList();
updateBookingSummary();
populateJadwalDatalist();
displayBookingHistory();
