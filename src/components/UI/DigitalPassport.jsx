import React, { useRef } from 'react';
import { Card } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function DigitalPassport({ user, account }) {
  const passportRef = useRef();

  const downloadPassport = async () => {
    const element = passportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`passport-${user.full_name}.pdf`);
  };

  const generateMRZ = () => {
    const passportNum = user.passport_number || account?.vnt_id || 'XXXXXXXXX';
    const surname = user.full_name?.split(' ').pop().toUpperCase() || 'CITIZEN';
    const givenNames = user.full_name?.split(' ').slice(0, -1).join('<').toUpperCase() || 'VANDEHOEKEN';
    const nationality = 'VND';
    const dob = user.date_of_birth ? user.date_of_birth.replace(/-/g, '').slice(2) : '000101';
    const sex = 'X';
    const expiry = '991231';
    
    const line1 = `P<${nationality}${surname}<<${givenNames}${'<'.repeat(Math.max(0, 39 - surname.length - givenNames.length))}`;
    const line2 = `${passportNum}${'<'.repeat(Math.max(0, 9 - passportNum.length))}${nationality}${dob}${sex}${expiry}${'<'.repeat(14)}0`;
    
    return { line1: line1.slice(0, 44), line2: line2.slice(0, 44) };
  };

  const mrz = generateMRZ();

  return (
    <div>
      <div ref={passportRef} className="bg-white p-8 rounded-lg border-4 border-[#1e3a5f]" style={{ width: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-[#c9a227]">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695c66aafd5e688e7dc17bdc/c00454b8d_CoatofArms.png"
            alt="Coat of Arms"
            className="w-16 h-16 mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-[#1e3a5f]">THE DEMOCRATIC REPUBLIC OF</h1>
          <h2 className="text-3xl font-bold text-[#c9a227]">VANDEHOEKEN</h2>
          <p className="text-sm text-slate-600 mt-1">PASSPORT / PASSEPORT</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-1">
            <div className="w-full aspect-[3/4] bg-slate-100 border-2 border-slate-300 rounded flex items-center justify-center overflow-hidden">
              {user.passport_picture ? (
                <img src={user.passport_picture} alt="Passport" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-sm">No Photo</span>
              )}
            </div>
          </div>

          <div className="col-span-2 space-y-3">
            <div>
              <p className="text-xs text-slate-600 uppercase">Type / Type</p>
              <p className="font-bold text-lg">P</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase">Code of issuing state</p>
              <p className="font-bold text-lg">VND</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase">Passport No. / No du passeport</p>
              <p className="font-bold text-lg">{user.passport_number || account?.vnt_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase">Surname / Nom</p>
              <p className="font-bold text-lg">{user.full_name?.split(' ').pop().toUpperCase() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase">Given names / Prénoms</p>
              <p className="font-bold text-lg">{user.full_name?.split(' ').slice(0, -1).join(' ').toUpperCase() || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase">Nationality</p>
                <p className="font-bold">VANDEHOEKEN</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase">Date of birth</p>
                <p className="font-bold">{user.date_of_birth || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase">Date of issue</p>
                <p className="font-bold">{new Date(user.created_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase">Date of expiry</p>
                <p className="font-bold">31 DEC 2099</p>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Readable Zone */}
        <div className="bg-slate-100 p-4 rounded font-mono text-xs border-2 border-slate-300">
          <p className="tracking-wider">{mrz.line1}</p>
          <p className="tracking-wider">{mrz.line2}</p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-slate-600">
          <p className="font-bold">Death Before Dishonor</p>
        </div>
      </div>

      <div className="text-center mt-6">
        <Button onClick={downloadPassport} className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
          <Download className="w-4 h-4 mr-2" />
          Download as PDF
        </Button>
      </div>
    </div>
  );
}
