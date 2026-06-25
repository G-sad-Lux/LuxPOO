import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Save, AlertCircle, KeySquare, HelpCircle } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryStore';
import confetti from 'canvas-confetti';

export const NewUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addUser, users } = useLibrary();

  // Form states
  const [matricula, setMatricula] = useState('');
  const [name, setName] = useState('');
  const [carrera, setCarrera] = useState('');
  const [email, setEmail] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // Pre-fill matricula if redirected from search page
  useEffect(() => {
    const stateMatricula = (location.state as any)?.matricula;
    if (stateMatricula) {
      setMatricula(stateMatricula);
    }
  }, [location]);

  // Handle Photo selection simulation
  const handlePhotoSimulation = () => {
    // Generate a random user profile picture from unsplash for mock fidelity
    const randomPhotos = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120"
    ];
    const picked = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
    setPhotoPreview(picked);
  };

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Keep only numbers
    setMatricula(val);
    
    // Auto-generate email based on matricula
    if (val) {
      setEmail(`al${val}@lux.edu.mx`);
    } else {
      setEmail('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (matricula.length < 5) {
      setError('La matrícula debe contener al menos 5 dígitos numéricos.');
      return;
    }

    if (users.some(u => u.matricula === matricula)) {
      setError('Esta matrícula ya se encuentra registrada en el sistema.');
      return;
    }

    if (!carrera) {
      setError('Debe seleccionar una carrera o licenciatura.');
      return;
    }

    // Generate random temporary password
    const generatedPass = Math.random().toString(36).slice(-8).toUpperCase();
    setTempPassword(generatedPass);

    // Save
    addUser({
      matricula,
      name,
      carrera,
      email,
      photoUrl: photoPreview || undefined
    });

    setSuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const carreras = [
    "Ingeniería en Sistemas Computacionales",
    "Licenciatura en Administración de Empresas",
    "Licenciatura en Psicología",
    "Licenciatura en Criminología",
    "Licenciatura en Pedagogía",
    "Licenciatura en Derecho"
  ];

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-3xl text-gray-800 font-bold">Registrar Nuevo Usuario</h2>
          <p className="text-gray-500 text-sm mt-1">
            Da de alta a un estudiante o docente en el padrón de la biblioteca.
          </p>
        </div>
      </div>

      {success ? (
        // Success panel showing temporary password
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100 space-y-6 text-center animate-in zoom-in duration-150">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100">
            <KeySquare size={32} />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-xl text-gray-800">¡Usuario Creado Exitosamente!</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              El alumno <span className="font-bold text-gray-700">{name}</span> ha sido guardado en la base de datos de SGBU. Se ha generado una clave temporal de inicio de sesión.
            </p>
          </div>

          <div className="p-5 bg-gray-50 rounded-2xl max-w-sm mx-auto border border-gray-200">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Contraseña Temporal Generada</p>
            <p className="font-mono text-2xl font-bold tracking-widest text-primary select-all">{tempPassword}</p>
            <p className="text-[9px] text-gray-400 mt-2">
              Se enviará automáticamente un correo con esta clave a: <span className="font-medium text-gray-600">{email}</span>
            </p>
          </div>

          <div className="pt-4 flex gap-4 justify-center">
            <button
              onClick={() => {
                setSuccess(false);
                setMatricula('');
                setName('');
                setCarrera('');
                setEmail('');
                setPhotoPreview(null);
                setTempPassword('');
              }}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
            >
              Registrar Otro Alumno
            </button>
            <button
              onClick={() => navigate('/usuarios')}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
            >
              Ir a Usuarios
            </button>
          </div>
        </div>
      ) : (
        // Registration Form
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8 relative">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Image Capture */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Fotografía del Alumno</span>
              <div 
                onClick={handlePhotoSimulation}
                className="h-40 w-40 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-secondary transition-all duration-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer overflow-hidden shadow-inner group relative"
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      Cambiar Foto
                    </div>
                  </>
                ) : (
                  <>
                    <Camera size={32} className="stroke-[1.5] group-hover:scale-110 transition-transform text-gray-400" />
                    <span className="text-[10px] font-bold mt-2 text-center px-4 leading-tight">Simular Carga de Foto</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-gray-400 text-center leading-normal max-w-[180px]">
                Haz clic en el círculo para simular la captura o carga de la foto de credencial.
              </p>
            </div>

            {/* Column 2 & 3: Input Fields */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Matricula Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <span>Matrícula</span>
                  <span title="Número de control del alumno de 5 o más dígitos" className="cursor-help">
                    <HelpCircle size={12} className="text-gray-400" />
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: 017497"
                  value={matricula}
                  onChange={handleMatriculaChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
                  required
                />
              </div>

              {/* Full Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Patricio Ávila Izaguirre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
                  required
                />
              </div>

              {/* Career Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Carrera o Licenciatura
                </label>
                <select
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
                  required
                >
                  <option value="">Selecciona la carrera...</option>
                  {carreras.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Institutional Email (Calculated) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Correo Institucional (Solo Lectura)
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  placeholder="al[matricula]@lux.edu.mx"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
                />
              </div>

            </div>
          </div>

          {/* Bottom Security Alert */}
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
            <KeySquare className="text-primary mt-0.5 shrink-0" size={16} />
            <p className="text-xs text-primary-hover leading-relaxed">
              <span className="font-bold">Aviso de seguridad integrado:</span> Al registrar al usuario, el sistema generará una contraseña temporal automática y la enviará al correo institucional para su activación y posterior cambio.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-md"
            >
              <Save size={16} />
              <span>Guardar Alumno</span>
            </button>
          </div>
          
        </form>
      )}
    </div>
  );
};
export default NewUser;
