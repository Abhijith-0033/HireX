import { User, Briefcase, GraduationCap, Code, Award, FolderGit2, FileText, ExternalLink, Mail, Phone, MapPin, Linkedin, Github, Clock } from 'lucide-react';

const CandidateProfileContent = ({ data, resumeUrl, onViewResume, isSnapshot, snapshotDate }) => {
    const info = data?.personal_info || {};

    return (
        <div className="space-y-8">
            {/* Snapshot Badge */}
            {isSnapshot && snapshotDate && (
                <div className="p-4 rounded-xl flex items-center gap-3 bg-blue-50 border border-blue-100">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                        Profile snapshot from <strong className="font-bold text-blue-700">{new Date(snapshotDate).toLocaleDateString()}</strong>
                    </span>
                </div>
            )}

            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 rounded-2xl p-6 border border-slate-100">
                {info.email && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Mail className="w-4 h-4 text-slate-400" />
                        </div>
                        <a href={`mailto:${info.email}`} className="font-semibold text-slate-900 hover:text-blue-600 truncate transition-colors" title={info.email}>{info.email}</a>
                    </div>
                )}
                {(info.phone || info.phone_number) && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Phone className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-semibold text-slate-900">{info.phone || info.phone_number}</span>
                    </div>
                )}
                {info.location && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-semibold text-slate-900">{info.location}</span>
                    </div>
                )}
                {(info.linkedin || info.linkedin_url) && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Linkedin className="w-4 h-4 text-blue-600" />
                        </div>
                        <a href={info.linkedin || info.linkedin_url} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-blue-600 truncate transition-colors" title={info.linkedin || info.linkedin_url}>LinkedIn Profile</a>
                    </div>
                )}
                {(info.github || info.github_url) && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Github className="w-4 h-4 text-slate-800" />
                        </div>
                        <a href={info.github || info.github_url} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-blue-600 truncate transition-colors" title={info.github || info.github_url}>GitHub Portfolio</a>
                    </div>
                )}
            </div>

            {/* About */}
            {(info.about || info.profile_description) && (
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Executive Summary</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        {info.about || info.profile_description}
                    </p>
                </div>
            )}

            {/* Resume Button */}
            {resumeUrl && (
                <button
                    onClick={onViewResume}
                    className="w-full h-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-sm font-black text-slate-600 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm"
                >
                    <FileText className="w-5 h-5" />
                    Extract Original Resume
                </button>
            )}

            {/* Skills */}
            {data?.skills?.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <Code className="w-3.5 h-3.5" /> Technical Matrix
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Experience */}
            {data?.experience?.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5" /> Career Trajectory
                    </h4>
                    <div className="space-y-4">
                        {data.experience.map((exp, i) => (
                            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-blue-600 transition-colors" />
                                <h5 className="font-black text-lg text-slate-900 tracking-tight">{exp.job_title || exp.title}</h5>
                                <p className="text-sm font-bold text-blue-600 mb-1">{exp.company || exp.company_name}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                    <Clock className="w-3 h-3" />
                                    {exp.start_date || exp.startDate} - {exp.is_current || exp.current ? 'Present' : (exp.end_date || exp.endDate)}
                                </div>
                                {(exp.description) && (
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {data?.education?.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5" /> Academic Foundation
                    </h4>
                    <div className="space-y-4">
                        {data.education.map((edu, i) => (
                            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
                                <h5 className="font-black text-lg text-slate-900 tracking-tight">{edu.degree}</h5>
                                <p className="text-sm font-bold text-emerald-600 mb-1">{edu.institution || edu.school}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <Clock className="w-3 h-3" />
                                    {edu.start_date || edu.startDate} - {edu.end_date || edu.endDate || edu.graduation_year}
                                </div>
                                {(edu.gpa || edu.grade) && (
                                    <div className="inline-flex px-2 py-1 bg-slate-100 rounded text-xs font-black text-slate-500 mt-2">
                                        GPA: {edu.gpa || edu.grade}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {data?.projects?.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <FolderGit2 className="w-3.5 h-3.5" /> Key Implementations
                    </h4>
                    <div className="space-y-4">
                        {data.projects.map((proj, i) => (
                            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-violet-200 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-violet-600 transition-colors" />
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-black text-lg text-slate-900 tracking-tight">{proj.project_title || proj.title}</h5>
                                    {(proj.project_link || proj.link) && (
                                        <a href={proj.project_link || proj.link} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                {(proj.project_description || proj.description) && (
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{proj.project_description || proj.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements */}
            {data?.achievements?.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <Award className="w-3.5 h-3.5" /> Distinctions
                    </h4>
                    <div className="space-y-3">
                        {data.achievements.map((ach, i) => (
                            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                                <div className="mt-1 w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                                <div>
                                    <h5 className="font-black text-slate-900">{ach.title}</h5>
                                    {ach.description && (
                                        <p className="text-sm text-slate-600 mt-1 font-medium">{ach.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Screening Question Answers */}
            {data?.answers?.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Analytical Responses
                    </h4>
                    <div className="space-y-4">
                        {data.answers.map((qa, i) => (
                            <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <div className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-start gap-2">
                                    <span className="text-blue-600">Q.</span> {qa.question}
                                </div>
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <p className="text-sm text-slate-900 font-medium leading-relaxed italic">"{qa.answer}"</p>
                                </div>
                                {qa.expected_answer && (
                                    <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1.5">Target Baseline</p>
                                        <p className="text-sm text-orange-900 font-medium">{qa.expected_answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateProfileContent;
