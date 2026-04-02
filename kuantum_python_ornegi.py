from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector
import numpy as np
import matplotlib.pyplot as plt

def main():
    print("--- Lise Öğrencileri İçin Qubit Python Uygulaması ---")
    print("Aşağıdaki değerleri değiştirerek Qubit'in Bloch Küresindeki durumunu kontrol edebiliriz.")
    
    # Qubit açılarını ayarla (Radyan cinsinden)   
    # pi/2 = 1.57 (Hadamard kapısı benzeri, süperpozisyon durumuna getirir)
    theta = 1.57
    phi = 0.78
    
    print(f"Tanımlanan Açı Değerleri:\nTheta (Eğiklik) = {theta}\nPhi (Faz/Dönüş) = {phi}\n")
    print("Durum vektörü hesaplanıyor: |ψ⟩ = cos(theta/2)|0⟩ + e^(i*phi)*sin(theta/2)|1⟩")

    # Denklem: |ψ⟩
    state = [
        np.cos(theta/2), 
        np.exp(1j*phi) * np.sin(theta/2)
    ]
    
    sv = Statevector(state)
    
    print("\nİşlem Başarılı! Ekrana Bloch Küresi Çizdiriliyor...")
    print("(Not: Bu grafiği çizebilmek için bilgisayarınızda 'qiskit' ve 'matplotlib' yüklü olmalıdır.)")
    print("pip install qiskit matplotlib")
    
    # Bloch Küresini çiz
    fig = plot_bloch_multivector(sv, title="Öğrenci Kuantum Uygulaması - Python Çıktısı")
    plt.show()

if __name__ == "__main__":
    main()
