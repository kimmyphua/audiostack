import { useMemo } from 'react';
import { audioAPI } from '../../../lib/api';
import { useQuery } from 'react-query';

function useGetAudioCategories(): { categories: string[] } {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => audioAPI.getCategories(),
  });
  const categories = useMemo(() => {
    return categoriesData?.data.categories || [];
  }, [categoriesData]);

  return { categories };
}

export default useGetAudioCategories;
