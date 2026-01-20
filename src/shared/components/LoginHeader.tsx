import Image from "next/image";

export function LoginHeader() {
  return (
    <header className="w-full bg-[#f0f0f0] border-b border-gray-300">
      <div className="max-w-[1200px] mx-auto flex items-center h-[80px]">
        {/* Logo and title container following the reference image structure */}
        <div className="relative h-[110px] w-[200px] bg-primary flex items-center justify-center -mb-[30px] shadow-md z-10">
          <Image 
            src="/logo-dipu.png" 
            alt="Diputación de Sevilla" 
            width={120} 
            height={60}
            className="object-contain"
          />
        </div>
        
        {/* Blue bar extension */}
        <div className="flex-1 h-[40px] bg-primary relative ml-[5px]">
           {/* This replicates the blue bar in the header of the image */}
        </div>
      </div>
      
      {/* Spacer to handle the overlapping logo box */}
      <div className="h-[30px] bg-transparent"></div>
    </header>
  );
}
