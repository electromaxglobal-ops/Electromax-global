import React from 'react';
import {
  Building2,
  ShieldCheck,
  Award,
  Factory,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Globe,
  Sparkles,
  Flame,
  Fan,
  Coffee,
  Zap,
} from 'lucide-react';
import { Company, Branch } from '../../types/erp.ts';

interface AboutUsViewProps {
  company: Company | null;
  branches: Branch[];
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ company, branches }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header with Official Electromax Global Logo */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] rounded-2xl p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-orange-500/15 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-3 flex items-center justify-center border-2 border-orange-500/50 shadow-2xl shrink-0">
            <img
              src="/electromax-logo.png"
              alt="ELECTROMAX GLOBAL Official Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Corporate Leadership & Heritage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              ELECTROMAX GLOBAL
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Leading manufacturing, OEM, wholesale and distribution enterprise specializing in premium home and industrial appliances under the flagship brand <strong>Snow Wave</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership Profile Card: Mr. Sushil Goyal */}
      <div className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-500">
              Executive Leadership
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Mr. Sushil Goyal
            </h2>
            <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
              Founder & Director — Electromax Global
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1 sm:text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Headquarters</div>
            <div className="font-bold text-slate-800 dark:text-slate-100">Jaipur, Rajasthan, India</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center sm:justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Registered Entity (GST 08)</span>
            </div>
          </div>
        </div>

        {/* Corporate Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Company</span>
            <div className="font-black text-sm text-slate-900 dark:text-white">
              ELECTROMAX GLOBAL
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Electromax Global Enterprises Pvt. Ltd., incorporated and operating under the Companies Act.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Founder & Director</span>
            <div className="font-black text-sm text-orange-500">
              Mr. Sushil Goyal
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Guiding product engineering, multi-plant production lines, and nationwide distributor networks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Location</span>
            <div className="font-black text-sm text-slate-900 dark:text-white">
              Jaipur, Rajasthan, India
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Vishwakarma Industrial Area (VKI), Jaipur — Premier industrial hub for precision electrical appliances.
            </p>
          </div>
        </div>

        {/* Founder's Mission & Product Specialization */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Manufacturing Specialization & Brand Portfolio
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Founded by <strong>Mr. Sushil Goyal</strong> in Jaipur, Rajasthan, <strong>Electromax Global</strong> is dedicated to delivering high-performance, energy-efficient, and durable consumer appliances. Operating advanced production and assembly facilities in Vishwakarma Industrial Area (VKI), Jaipur, the company specializes in:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Flame className="w-4 h-4" /></span>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Room Heaters</div>
                <div className="text-[10px] text-slate-400">Halogen, Carbon & Convector</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Coffee className="w-4 h-4" /></span>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Electric Kettles</div>
                <div className="text-[10px] text-slate-400">SS 304 & Borosilicate Glass</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Fan className="w-4 h-4" /></span>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Pedestal Fans</div>
                <div className="text-[10px] text-slate-400">100% Copper High Speed</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Fan className="w-4 h-4" /></span>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Table & Wall Fans</div>
                <div className="text-[10px] text-slate-400">Dual cord & quiet oscillation</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Zap className="w-4 h-4" /></span>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Mosquito Bats</div>
                <div className="text-[10px] text-slate-400">1200mAh Li-ion & Type-C</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><ShieldCheck className="w-4 h-4" /></span>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Snow Wave Brand</div>
                <div className="text-[10px] text-slate-400">Flagship Consumer Label</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Locations in Jaipur */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Factory className="w-4 h-4 text-orange-500" />
            <span>Manufacturing Facilities in Jaipur</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {branches.map(b => (
              <div key={b.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-800 dark:text-slate-200">{b.name}</div>
                <div className="text-[10px] font-mono text-orange-500">{b.code}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{b.address}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
