# Gerekli kütüphanelerin içe aktarılması
from qiskit import QuantumCircuit
from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector
import matplotlib.pyplot as plt

# 1. Bir kuantum devresi oluştur (1 Qubitlik)
qc = QuantumCircuit(1)

# 2. Operatör Uygula (Örn: Hadamard Kapısı ile Süperpozisyon) [cite: 31, 33]
qc.h(0) 

# 3. Durum vektörünü hesapla
state = Statevector.from_instruction(qc)

# 4. Bloch Küresini görselleştir
plot_bloch_multivector(state)
plt.show()
