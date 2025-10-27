// Sample Malaysian texts for training
// These will be replaced by the streaming endpoint later

export const sampleTexts = [
  "Saya nak pergi kedai runcit untuk beli barang dapur. Mak suruh beli beras, minyak masak, dan gula. Lepas tu saya kena balik cepat sebab nak tolong masak.",
  "Pagi tadi hujan lebat sangat. Jalan raya semua banjir, kereta pun tak boleh lalu. Saya terpaksa tunggu kat rumah je sampai hujan berhenti.",
  "Adik saya belajar kat universiti sekarang. Dia ambil kos kejuruteraan komputer. Setiap hari dia sibuk dengan assignment dan projek.",
  "Kami sekeluarga suka makan kat restoran mamak. Roti canai dengan teh tarik memang sedap. Harga pun berpatutan untuk semua orang.",
  "Esok saya ada temuduga kerja. Kena bangun awal dan pakai baju formal. Harap-harap dapat kerja ni sebab gaji dia bagus.",
  "Nenek saya pandai masak rendang ayam. Setiap kali raya, dia mesti masak untuk semua cucu. Memang sedap dan semua orang suka.",
  "Bas sekolah datang pukul tujuh pagi. Budak-budak kena tunggu kat perhentian bas. Kalau lambat, bas tak tunggu dan kena cari transport lain.",
  "Saya suka tengok wayang dengan kawan-kawan. Kami selalu pergi shopping mall yang ada panggung besar. Lepas tu makan kat food court.",
]

let lastTextIndex = -1

export function getRandomText(): string {
  let newIndex
  do {
    newIndex = Math.floor(Math.random() * sampleTexts.length)
  } while (newIndex === lastTextIndex && sampleTexts.length > 1)

  lastTextIndex = newIndex
  console.log("[v0] Selected text index:", newIndex)
  return sampleTexts[newIndex]
}
