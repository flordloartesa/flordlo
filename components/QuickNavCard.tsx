interface Props {
  title: string;
  subtitle: string;
}

export default function QuickNavCard({ title, subtitle }: Props) {
  return (
    <div className="bg-[#F8F6F4] hover:bg-[#EAEAEA] transition-colors duration-300 rounded-2xl p-6 flex flex-col justify-between min-h-[140px] cursor-pointer group">
      <h3 className="font-bold text-lg text-[#37374B]">{title}</h3>
      <p className="text-[11px] font-bold text-[#737373] uppercase tracking-wider group-hover:text-[#37374B] transition-colors">
        {subtitle}
      </p>
    </div>
  );
}