const latKaabah = 21.4225;
const lonKaabah = 39.8262;
let kiblat = 0;

function updateInfo(text) {
  document.getElementById("info").textContent = text;
}

function hitungArahKiblat(lat1, lon1) {
  const dLon = (lonKaabah - lon1) * Math.PI / 180;
  lat1 *= Math.PI / 180;
  const lat2 = latKaabah * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function bukaKamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      document.getElementById("camera").srcObject = stream;
    }).catch(() => updateInfo("❌ Gagal akses kamera"));
}

function aktifkanSensor() {
  const handler = e => {
    const heading = e.alpha ?? 0;
    const rotasi = kiblat - heading;
    document.getElementById("arrow").style.transform = `rotate(${rotasi}deg)`;
    updateInfo(e.absolute ? `✅ Akurasi tinggi` : `⚠️ Akurasi rendah`);
  };

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(res => {
      if (res === 'granted') window.addEventListener('deviceorientation', handler, true);
      else updateInfo("❌ Sensor ditolak");
    });
  } else {
    window.addEventListener('deviceorientation', handler, true);
  }
}

function pinLokasi() {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    kiblat = hitungArahKiblat(lat, lon);
    updateInfo(`📍 Lokasi dipin. Arah: ${kiblat.toFixed(2)}°`);
  }, () => updateInfo("❌ Gagal ambil lokasi"));
}

// Inisialisasi awal
pinLokasi();
bukaKamera();
aktifkanSensor();

// Snapshot kamera
document.getElementById("capture").onclick = () => {
  const vid = document.getElementById("camera");
  const canvas = document.getElementById("snapshot");
  canvas.width = vid.videoWidth;
  canvas.height = vid.videoHeight;
  canvas.getContext('2d').drawImage(vid, 0, 0);
  updateInfo("📸 Snapshot diambil");
};

// Reset arah panah
document.getElementById("reset").onclick = () => {
  document.getElementById("arrow").style.transform = `rotate(0deg)`;
  updateInfo("🔁 Arah direset");
};

// Pin ulang lokasi
document.getElementById("loc").onclick = pinLokasi;

// Share ke teman
document.getElementById("share").onclick = () => {
  if (navigator.share) {
    navigator.share({
      title: "Arah Kiblat Kamera",
      text: "Coba arah kiblat interaktif ini!",
      url: location.href
    }).then(() => updateInfo("✅ Dibagikan!"))
      .catch(() => updateInfo("❌ Gagal membagikan"));
  } else {
    updateInfo("❌ Browser tidak mendukung fitur share");
  }
};

// QR Code otomatis
new QRious({
  element: document.getElementById("qr"),
  value: location.href,
  size: 120,
});
