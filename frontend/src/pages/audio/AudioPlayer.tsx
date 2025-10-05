import { ArrowLeft, Edit, Pause, Play, Trash2, Volume2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import { audioAPI } from '../../lib/api';
import { AudioFile } from '../../types';
import { getAudioBlobUrl } from '../../utils/audioFileHelpers';
import { formatFileSize, formatTime } from '../../utils/formatters';
import styles from './AudioPlayer.module.scss';
import { useAudioFiles } from './hooks/useAudioFiles';
import { useAudioPlayer } from './hooks/useAudioPlayer';

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    audioRef,
    state: { playing, currentTime, duration, volume },
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    handleVolumeChange,
    handleEnded,
  } = useAudioPlayer(audioUrl);
  const { handleDelete } = useAudioFiles();

  const { data: audioFile, isLoading: isLoadingAudioFile } = useQuery({
    queryKey: ['audioFile', id],
    queryFn: async () => {
      const response = await audioAPI.getFile(id!);
      return response.data.audioFile as AudioFile;
    },
    enabled: !!id,
    onSuccess: async () => {
      try {
        const blobUrl = await getAudioBlobUrl(id!);
        setAudioUrl(blobUrl);
      } catch (error) {
        console.error('Error loading audio file:', error);
        toast.error('Failed to load audio file');
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to load audio file: ${error.response?.data?.error}`);
      console.error('Load audio file error:', error);
    },
  });

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    handleSeek(time);
  };

  const handleVolumeChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    handleVolumeChange(newVolume);
  };

  if (isLoadingAudioFile) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    );
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
        <Link to='/files' className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Audio Player</h1>
          <div className={styles.actions}>
            <Link to={`/edit/${audioFile.id}`} className={styles.editButton}>
              <Edit className={styles.editIcon} />
            </Link>
            <button
              onClick={e => {
                if (id) {
                  const onConfirm = () => {
                    navigate('/files');
                  };
                  handleDelete(e, id, onConfirm);
                }
              }}
              className={`${styles.deleteButton}`}
              title='Delete'
            >
              <Trash2 className={styles.actionIcon} />
            </button>
          </div>
          <p className={styles.subtitle}>
            Now playing: {audioFile.originalName}
          </p>
        </div>
      </div>

      <div className={styles.playerCard}>
        <div className={styles.playerContent}>
          {/* Audio file info */}
          <div className={styles.fileInfo}>
            <h2 className={styles.fileName}>{audioFile.originalName}</h2>
            {audioFile.description && (
              <p className={styles.fileDescription}>{audioFile.description}</p>
            )}
            <div className={styles.fileMeta}>
              <span className={styles.category}>{audioFile.category}</span>
              <span className={styles.fileSize}>
                {formatFileSize(audioFile.fileSize)}
              </span>
              <span className={styles.uploadDate}>
                {new Date(audioFile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Audio player */}
          <div className={styles.audioPlayer}>
            <audio
              ref={audioRef}
              src={audioUrl || ''}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
            />

            <div className={styles.audioControls}>
              <button onClick={togglePlay} className={styles.playButton}>
                {playing ? (
                  <Pause className={styles.playIcon} />
                ) : (
                  <Play className={styles.playIcon} />
                )}
              </button>

              <div className={styles.progressSection}>
                <input
                  type='range'
                  min='0'
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeekChange}
                  className={styles.progressBar}
                />
                <div className={styles.timeDisplay}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className={styles.volumeSection}>
                <Volume2 className={styles.volumeIcon} />
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={volume}
                  onChange={handleVolumeChangeInput}
                  className={styles.volumeSlider}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
