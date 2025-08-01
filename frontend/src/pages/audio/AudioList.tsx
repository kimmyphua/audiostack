import { Edit, Music, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatDate,
  formatFileSize,
  truncateString,
} from '../../utils/formatters';
import styles from './AudioList.module.scss';
import { useAudioFiles } from './hooks/useAudioFiles';
import Spinner from '../../components/Spinner';
import useGetAudioCategories from './hooks/useGetAudioCategories';

export default function AudioList() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const { audioFiles, isLoadingAudioFiles, handleDelete, handleSearch } =
    useAudioFiles();
  const { categories } = useGetAudioCategories();
  const handleRowClick = (fileId: string) => {
    navigate(`/player/${fileId}`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  const handleSearchResult = () => {
    handleSearch({ search, category });
  };

  if (isLoadingAudioFiles) {
    return <Spinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>My Audio Files</h1>
          <p className={styles.subtitle}>
            Manage and play your uploaded audio files.
          </p>
        </div>
        <Link to='/upload' className='btn-primary'>
          Upload New
        </Link>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchForm}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <input
              type='text'
              placeholder='Search audio files...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='input'
            />
          </div>
          <div className={styles.categorySelect}>
            <select
              id='category'
              name='category'
              value={category}
              onChange={e => setCategory(e.target.value)}
              className='input'
            >
              <option value=''>All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleSearchResult} className='btn-secondary'>
            Search
          </button>
        </div>

        {audioFiles?.length === 0 ? (
          <div className={styles.emptyState}>
            <Music className={styles.icon} />
            <h3 className={styles.title}>No audio files</h3>
            <p className={styles.description}>
              Get started by uploading your first audio file.
            </p>
            <div className={styles.action}>
              <Link to='/upload' className='btn-primary'>
                Upload Audio
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>File</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Size</th>
                  <th className={styles.th}>Uploaded</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {audioFiles?.map(file => (
                  <tr
                    key={file.id}
                    className={styles.tr}
                    onClick={() => handleRowClick(file.id)}
                  >
                    <td className={styles.td}>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileName}>
                          {truncateString(file.originalName, 30)}
                        </div>
                        {file.description && (
                          <div className={styles.fileDescription}>
                            {truncateString(file.description)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.category}>{file.category}</span>
                    </td>
                    <td className={`${styles.td} ${styles.fileSize}`}>
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className={`${styles.td} ${styles.uploadDate}`}>
                      {formatDate(file.createdAt)}
                    </td>
                    <td className={`${styles.td} ${styles.actions}`}>
                      <div className={styles.actions}>
                        <button
                          onClick={e => handleEdit(e, file.id)}
                          className={`${styles.actionButton} ${styles.edit}`}
                          title='Edit'
                        >
                          <Edit className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={e => handleDelete(e, file.id)}
                          className={`${styles.actionButton} ${styles.delete}`}
                          title='Delete'
                        >
                          <Trash2 className={styles.actionIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
