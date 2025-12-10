interface SkeletonProps {
  className?: string;
  count?: number;
}

const Skeleton = ({ className = '', count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <Skeleton className="h-4 w-1/2 mb-4" />
    <Skeleton className="h-8 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full" count={3} />
  </div>
);

export default Skeleton;