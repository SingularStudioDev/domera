interface UnitImageDisplayProps {
  mainImage: string;
  unitNumber: string;
}

export default function UnitImageDisplay({
  mainImage,
  unitNumber,
}: UnitImageDisplayProps) {
  return (
    <div>
      <img
        src={mainImage}
        alt={`Unidad ${unitNumber}`}
        className="h-[564px] w-full rounded-3xl border border-gray-300 object-cover"
      />
    </div>
  );
}
