import cirq

def main():
    print("="*50)
    print("     4. KUANTUM IŞINLANMA (TELEPORTATION)    ")
    print("="*50)
    print("Bilim kurgu gerçeğe dönüşüyor: Bir kuantum bilgisini (parçacığın kendisini değil),")
    print("dolanıklık bağı köprüsü yardımıyla anında uzaktaki başka bir yere ışınlıyoruz!\n")

    # 3 Aktör: 
    # msg: Işınlanmak istenen veri
    # alice / bob: Aralarında telepatik kuantum ağı kurulan iki istasyon
    msg, alice, bob = cirq.LineQubit.range(3)
    circuit = cirq.Circuit()

    # -----------------------------------------------------
    # ADIM 1: Yollanacak bilgiyi hazırlayalım (Örneğin içine X kapısıyla [1] yükleyelim)
    circuit.append(cirq.X(msg))
    # -----------------------------------------------------

    # -----------------------------------------------------
    # ADIM 2: Dolanıklık Köprüsü Kurulumu (Alice ve Bob arasında ağ kur)
    circuit.append(cirq.H(alice))
    circuit.append(cirq.CNOT(alice, bob))
    # -----------------------------------------------------

    # -----------------------------------------------------
    # ADIM 3: Işınlanma Gerçekleşiyor
    # Alice kendi mesaj kutusunu ve ağ modülünü aynı anda parçalayıp (ölçüp) imha ediyor
    circuit.append(cirq.CNOT(msg, alice))
    circuit.append(cirq.H(msg))
    circuit.append(cirq.measure(msg, alice))
    # -----------------------------------------------------

    # -----------------------------------------------------
    # ADIM 4: Bob bilgiyi geri topluyor
    # Parçalanan sonuçların rüzgarı telepatik yolla Bob'un modülünde yeniden inşa ediliyor!
    circuit.append(cirq.CNOT(alice, bob)) # (Gelen şifreye göre ters düz et)
    circuit.append(cirq.CZ(msg, bob))     # (Gelen şifreye göre faz çevir)

    # Bob'un kutusunu aç ve kontrol et: Acaba Mesaj (1) gelmiş mi?
    circuit.append(cirq.measure(bob, key='bob_olcum_sonucu'))
    # -----------------------------------------------------

    print("IŞINLANMA (TELEPORTATION) DEVRENİZ:\n")
    print(circuit)

    # Test edelim
    simulator = cirq.Simulator()
    result = simulator.run(circuit, repetitions=1)
    print("\nSimülasyon çalıştı. Mesaj [1] ışınlanmıştı.")
    
    # 1 gelirse ışınlanma başarılıdır!
    gelen_mesaj = result.measurements['bob_olcum_sonucu'][0]
    print(f"Bob'un Kutusunu Açtık ve Gelen Mesaja Baktık: [{gelen_mesaj[0]}]")
    print("Işınlanma Başarılı!" if gelen_mesaj[0] == 1 else "Işınlanma Başarısız!")

if __name__ == "__main__":
    main()
