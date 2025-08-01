import { ArrowLeft, Music } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { audioAPI } from '../../lib/api';
import { AudioFile } from '../../types';
import { formatFileSize } from '../../utils/formatters';
import styles from './AudioEdit.module.scss';
import Spinner from '../../components/Spinner';
import { useMutation, useQuery } from 'react-query';
import useGetAudioCategories from './hooks/useGetAudioCategories';

export default function AudioEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');

  const { isLoading: isLoadingAudioFile } = useQuery({
    queryKey: ['audioFile', id],
    queryFn: () => audioAPI.getFile(id!),
    enabled: !!id,
    onSuccess: audioFileData => {
      setAudioFile(audioFileData.data.audioFile);
      setDescription(audioFileData.data.audioFile.description || '');
      setCategory(audioFileData.data.audioFile.category);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.details
          .map((detail: any) => detail.message)
          .join(', ') || 'Failed to load audio file'
      );
      console.error('Load audio file error:', error);
    },
  });
  const { categories } = useGetAudioCategories();
  const { mutate: handleSubmit, isLoading: isSaving } = useMutation({
    mutationFn: () =>
      audioAPI.updateFile(audioFile!.id, {
        description,
        category,
      }),
    onSuccess: () => {
      toast.success('Audio file updated successfully!');
      navigate(`/player/${audioFile!.id}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.details
          .map((detail: any) => detail.message)
          .join(', ') || 'Failed to update audio file'
      );
      console.error('Update audio file error:', error);
    },
  });

  if (isLoadingAudioFile) {
    return <Spinner />;
  }

  if (!audioFile) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>Audio file not found</h3>
        <p className={styles.errorDescription}>
          The audio file you're looking for doesn't exist or you don't have
          permission to access it.
        </p>
        <div>
          <Link to='/files' className={styles.backButton}>
            Back to Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to={`/player/${audioFile.id}`} className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Edit Audio File</h1>
          <p className={styles.subtitle}>Update your audio file information</p>
        </div>
      </div>

      <div className={styles.editCard}>
        <div className={styles.editContent}>
          {/* Current file info */}
          <div className={styles.fileInfo}>
            <div className={styles.fileIcon}>
              <Music className={styles.icon} />
            </div>
            <div className={styles.fileDetails}>
              <h2 className={styles.fileName}>{audioFile.originalName}</h2>
              <div className={styles.fileMeta}>
                <span className={styles.fileSize}>
                  {formatFileSize(audioFile.fileSize)}
                </span>
                <span className={styles.uploadDate}>
                  {new Date(audioFile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor='category' className={styles.label}>
                Category
              </label>
              <select
                id='category'
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={styles.select}
              >
                {categories?.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor='description' className={styles.label}>
                Description
              </label>
              <textarea
                id='description'
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={styles.textarea}
                placeholder='Describe your audio file...'
              />
            </div>

            <div className={styles.actions}>
              <button
                type='button'
                onClick={() => navigate(`/player/${audioFile.id}`)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit()}
                type='submit'
                disabled={isSaving}
                className='btn-primary'
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
