const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*", // Gerekirse sadece belirli istemcilerle sınırla
        methods: ["GET", "POST"]
    },
});

// Sunucu Testi
app.get("/", (req, res) => {
    res.send("AFAD İletişim Sunucusu Çalışıyor!");
});

// Bağlantı
io.on("connection", (socket) => {
    console.log(`✅ Yeni kullanıcı bağlandı: ${socket.id}`);

    // Odaya katılma
    socket.on("oda_katil", (odaAdi) => {
        socket.join(odaAdi);
        console.log(`📌 ${socket.id} kullanıcısı '${odaAdi}' odasına katıldı`);
        // İsteğe bağlı: Odaya katılanlara bildirim
        io.to(odaAdi).emit("sistem_mesaji", `${socket.id} odaya katıldı`);
    });

    // Mesaj gönderme
    socket.on("mesaj_gonder", (data) => {
        console.log(`[MESAJ] [${data.oda}] ${data.kullanici}: ${data.mesaj}`);
        io.to(data.oda).emit("mesaj_al", {
            kullanici: data.kullanici,
            mesaj: data.mesaj
        });
    });

    // Konum gönderme
    socket.on("konum_gonder", (konum) => {
        console.log(`[KONUM] [${konum.oda}] Enlem: ${konum.enlem}, Boylam: ${konum.boylam}`);
        io.to(konum.oda).emit("konum_al", {
            enlem: konum.enlem,
            boylam: konum.boylam
        });
    });

    // Bağlantı kesildi
    socket.on("disconnect", () => {
        console.log(`❌ Kullanıcı ayrıldı: ${socket.id}`);
    });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
}).on("error", (err) => {
    console.error(`❌ Sunucu başlatılamadı: ${err.message}`);
});
