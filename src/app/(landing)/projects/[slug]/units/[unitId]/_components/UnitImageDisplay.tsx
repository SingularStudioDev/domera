import Image from 'next/image';

interface UnitImageDisplayProps {
  mainImage: string;
  unitNumber: string;
}

const UnitImageDisplay = ({ mainImage, unitNumber }: UnitImageDisplayProps) => {
  return (
    <div>
      <Image
        src={mainImage}
        alt={`Unidad ${unitNumber}`}
        width={640}
        height={564}
        className="h-[564px] w-full rounded-3xl border border-gray-300 object-cover"
      />
    </div>
  );
};

export default UnitImageDisplay;