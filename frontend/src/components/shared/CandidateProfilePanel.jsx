import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { getApplicationProfileSnapshot, getApplicationResume } from '../../api/applications';
import CandidateProfileContent from './CandidateProfileContent';

/**
 * CandidateProfilePanel
 * A side-panel component for recruiters to view a candidate's profile snapshot.
 * Styled exclusively for the Provider light theme.
 */
const CandidateProfilePanel = ({ applicationId, isOpen, onClose, candidateName = 'Candidate', initialData = null, initialResumeUrl = null }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [isSnapshot, setIsSnapshot] = useState(false);
    const [snapshotDate, setSnapshotDate] = useState(null);
    const [resumeUrl, setResumeUrl] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setProfileData(initialData);
                setLoading(false);
                if (initialResumeUrl) setResumeUrl(initialResumeUrl);
            } else if (applicationId) {
                fetchProfileSnapshot();
                fetchResume();
            }
        }
    }, [isOpen, applicationId, initialData, initialResumeUrl]);

    const fetchProfileSnapshot = async () => {
        if (initialData) return;
        try {
            setLoading(true);
            setError('');
            const response = await getApplicationProfileSnapshot(applicationId);
            if (response.success) {
                setProfileData(response.data.snapshot);
                setIsSnapshot(response.data.is_snapshot);
                setSnapshotDate(response.data.snapshot_date);
            }
        } catch (err) {
            console.error('Error fetching profile snapshot:', err);
            setError('Failed to load candidate profile.');
        } finally {
            setLoading(false);
        }
    };

    const fetchResume = async () => {
        try {
            const blob = await getApplicationResume(applicationId);
            if (blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                setResumeUrl(url);
            }
        } catch (err) {
            console.error('Failed to fetch resume:', err);
        }
    };

    const handleViewResume = () => {
        if (resumeUrl) {
            window.open(resumeUrl, '_blank');
        }
    };

    if (!isOpen) return null;

    const info = profileData?.personal_info || {};

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose}></div>

            {/* Side Panel */}
            <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 transform transition-transform duration-300">
                {/* Header */}
                <div className="flex-none border-b border-slate-200 p-6 bg-slate-50/80 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        {profileData?.profile_image_url ? (
                            <img src={profileData.profile_image_url} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <User className="w-6 h-6" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{info.name || candidateName}</h2>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-0.5">{info.title || info.job_title || 'Candidate Profile'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content area: Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 provider-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            <p className="font-medium text-sm">Loading candidate profile data...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-rose-500 font-medium">
                            {error}
                        </div>
                    ) : (
                        <CandidateProfileContent
                            data={profileData}
                            resumeUrl={resumeUrl}
                            onViewResume={handleViewResume}
                            isSnapshot={isSnapshot}
                            snapshotDate={snapshotDate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateProfilePanel;
