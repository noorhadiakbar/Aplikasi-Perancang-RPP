import { DOC_TYPE_LABELS, QUESTION_TYPE_LABELS, findApproach, findCurriculum, findMethod, findModel, findStrategy } from "@/lib/pedagogy";
import type { LessonDocument, User } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="w-56 border border-slate-400 bg-slate-50 px-2 py-1.5 align-top text-slate-700">
        {label}
      </td>
      <td className="border border-slate-400 px-2 py-1.5">{value || "-"}</td>
    </tr>
  );
}

// Render only rows with content — the preview sheet stays clean while the wizard is empty.
function hasText(value: string) {
  return value.trim().length > 0;
}

const TH = "border border-slate-400 px-2 py-1.5";
const TD = "border border-slate-400 px-2 py-1.5 align-top";

function LkpdBody({ doc }: { doc: LessonDocument }) {
  return (
    <>
      <Section title="Identitas LKPD">
        <table className="w-full border-collapse">
          <tbody>
            <Field label="Mata Pelajaran" value={doc.subject} />
            <Field label="Jenjang / Kelas / Fase" value={`${doc.level}${doc.grade ? ` — Kelas ${doc.grade}` : ""}${doc.phase ? ` — Fase ${doc.phase}` : ""}`} />
            <Field label="Alokasi Waktu" value={doc.time_allocation} />
            <Field label="Tujuan Pembelajaran" value={doc.objectives.join("; ")} />
            <Field label="Alat & Bahan" value={doc.media} />
          </tbody>
        </table>
      </Section>
      <Section title="Identitas Peserta Didik">
        <p>Nama: ............................................................ Kelas: ............ Tanggal: ....................</p>
      </Section>
      <Section title="Petunjuk Pengerjaan">
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>Berdoalah sebelum mengerjakan.</li>
          <li>Baca setiap soal dengan teliti, lalu kerjakan sesuai perintah.</li>
          <li>Untuk pilihan ganda, beri tanda silang (X) pada jawaban yang paling tepat.</li>
          <li>Tanyakan kepada guru jika ada yang belum dipahami.</li>
        </ol>
      </Section>
      <Section title="Kegiatan & Soal">
        <ol className="space-y-3">
          {doc.assessment_items.map((item) => (
            <li key={item.order} className="flex gap-2">
              <span className="w-6 shrink-0">{item.order}.</span>
              <div className="flex-1">
                <p className="whitespace-pre-line">{item.question || "-"}</p>
                {item.question_type === "isian" || item.question_type === "menjodohkan" ? (
                  <p className="mt-1">Jawab: ..................................................................</p>
                ) : item.question_type !== "pilihan_ganda" ? (
                  <div className="mt-1 h-20 rounded border border-dashed border-slate-400" />
                ) : null}
              </div>
              <span className="shrink-0 text-[11px] text-slate-500">({item.points})</span>
            </li>
          ))}
        </ol>
      </Section>
      <Section title={`Kriteria Ketercapaian (KKTP)${doc.kkm_score ? ` — batas tuntas ${doc.kkm_score}` : ""}`}>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className={`${TH} w-32`}>Rentang Nilai</th>
              <th className={TH}>Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {doc.kktp_intervals.map((iv, i) => (
              <tr key={i}>
                <td className={`${TD} text-center font-semibold`}>{iv.range_label}</td>
                <td className={TD}>{iv.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2">Nilai = (Skor perolehan ÷ {doc.assessment_items.reduce((s, i) => s + i.points, 0)}) × 100 &nbsp;·&nbsp; Nilai: ........ &nbsp;·&nbsp; Paraf guru: ........</p>
      </Section>
    </>
  );
}

function SumatifBody({ doc, cpLabel }: { doc: LessonDocument; cpLabel: string }) {
  const items = doc.assessment_items;
  const mc = items.filter((i) => i.question_type === "pilihan_ganda");
  const others = items.filter((i) => i.question_type !== "pilihan_ganda");
  const maxScore = items.reduce((s, i) => s + i.points, 0);

  return (
    <>
      <Section title="Identitas Asesmen">
        <table className="w-full border-collapse">
          <tbody>
            <Field label="Jenis Asesmen" value={`Asesmen Sumatif ${doc.assessment_scope}`} />
            <Field label="Mata Pelajaran" value={doc.subject} />
            <Field label="Jenjang / Kelas / Fase" value={`${doc.level}${doc.grade ? ` — Kelas ${doc.grade}` : ""}${doc.phase ? ` — Fase ${doc.phase}` : ""}`} />
            <Field label="Waktu Pengerjaan" value={doc.exam_duration} />
            <Field label="Jumlah & Bentuk Soal" value={`${items.length} butir (${mc.length} pilihan ganda, ${others.length} non-PG)`} />
            <Field label="Tahun Ajaran" value={doc.academic_year} />
          </tbody>
        </table>
      </Section>

      {hasText(doc.cp) && (
        <Section title={cpLabel}>
          <p className="whitespace-pre-line">{doc.cp}</p>
        </Section>
      )}

      <Section title="A. Kisi-Kisi Soal">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className={`${TH} w-8`}>No</th>
              <th className={TH}>Tujuan Pembelajaran</th>
              <th className={TH}>Materi</th>
              <th className={TH}>Indikator Soal</th>
              <th className={`${TH} w-12`}>Level</th>
              <th className={`${TH} w-20`}>Bentuk</th>
              <th className={`${TH} w-12`}>Skor</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className={`${TD} text-center text-slate-500`} colSpan={7}>Belum ada butir soal.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.order}>
                  <td className={`${TD} text-center`}>{item.order}</td>
                  <td className={TD}>{item.objective || "-"}</td>
                  <td className={TD}>{item.content || "-"}</td>
                  <td className={TD}>{item.indicator || "-"}</td>
                  <td className={`${TD} text-center`}>{item.cognitive_level}</td>
                  <td className={TD}>{QUESTION_TYPE_LABELS[item.question_type] ?? item.question_type}</td>
                  <td className={`${TD} text-center`}>{item.points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      <Section title="B. Naskah Soal">
        {mc.length > 0 && <p className="mb-1 font-semibold">I. Pilihan Ganda — pilih satu jawaban yang paling tepat!</p>}
        <ol className="space-y-2">
          {mc.map((item) => (
            <li key={item.order} className="flex gap-2">
              <span className="w-6 shrink-0">{item.order}.</span>
              <p className="whitespace-pre-line">{item.question || "-"}</p>
            </li>
          ))}
        </ol>
        {others.length > 0 && <p className="mb-1 mt-3 font-semibold">II. Uraian / Non-Pilihan Ganda — jawablah dengan jelas!</p>}
        <ol className="space-y-2">
          {others.map((item) => (
            <li key={item.order} className="flex gap-2">
              <span className="w-6 shrink-0">{item.order}.</span>
              <p className="whitespace-pre-line">{item.question || "-"}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="C. Kunci Jawaban & Pedoman Penskoran">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className={`${TH} w-8`}>No</th>
              <th className={TH}>Kunci / Jawaban Ideal</th>
              <th className={`${TH} w-14`}>Skor</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.order}>
                <td className={`${TD} text-center`}>{item.order}</td>
                <td className={`${TD} whitespace-pre-line`}>{item.answer || "-"}</td>
                <td className={`${TD} text-center`}>{item.points}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className={TD} colSpan={2}>Skor Maksimal</td>
              <td className={`${TD} text-center`}>{maxScore}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2">
          <span className="font-semibold">Nilai Akhir</span> = (Skor Perolehan ÷ {maxScore || "Skor Maksimal"}) × 100
        </p>
      </Section>

      {doc.scoring_rubric.length > 0 && (
        <Section title="D. Rubrik Penilaian">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className={TH}>Kriteria</th>
                <th className={TH}>Sangat Baik (4)</th>
                <th className={TH}>Baik (3)</th>
                <th className={TH}>Cukup (2)</th>
                <th className={TH}>Perlu Bimbingan (1)</th>
              </tr>
            </thead>
            <tbody>
              {doc.scoring_rubric.map((row, i) => (
                <tr key={i}>
                  <td className={`${TD} font-semibold`}>{row.criterion}</td>
                  <td className={TD}>{row.excellent}</td>
                  <td className={TD}>{row.good}</td>
                  <td className={TD}>{row.adequate}</td>
                  <td className={TD}>{row.needs_guidance}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2">Nilai rubrik = (Jumlah skor kriteria ÷ {doc.scoring_rubric.length * 4}) × 100</p>
        </Section>
      )}
    </>
  );
}

export function DocumentSheet({ doc, profile }: { doc: LessonDocument; profile?: User | null }) {
  const model = findModel(doc.model);
  const approach = findApproach(doc.approach);
  const method = findMethod(doc.method);
  const strategy = findStrategy(doc.strategy);
  const curriculum = findCurriculum(doc.curriculum);
  const isAtP = doc.doc_type === "atp";
  const isKktp = doc.doc_type === "kktp";
  const isSumatif = doc.doc_type === "sumatif";
  const isLkpd = doc.doc_type === "lkpd";
  const schoolName = doc.school_name || profile?.school || "";
  const cpLabel = doc.curriculum === "k13" ? "Kompetensi Dasar (KD)" : "Capaian Pembelajaran (CP)";

  return (
    <article className="print-page print-sheet rounded-lg border border-slate-300 bg-white p-8 text-[13px] leading-relaxed text-slate-900 shadow-sm">
      <header className="border-b-4 border-double border-slate-900 pb-3">
        <div className="flex items-center gap-4">
          {profile?.logo ? (
            <img src={profile.logo} alt="Logo sekolah" className="h-16 w-16 shrink-0 object-contain" data-testid="sheet-school-logo" />
          ) : null}
          <div className="flex-1 text-center">
            <p className="font-heading text-lg font-bold uppercase tracking-tight" data-testid="sheet-school-name">
              {schoolName || "NAMA SATUAN PENDIDIKAN"}
            </p>
            {profile && (profile.school_address || profile.npsn) ? (
              <p className="text-[11px] text-slate-600" data-testid="sheet-school-address">
                {profile.school_address}
                {profile.school_address && profile.npsn ? " · " : ""}
                {profile.npsn ? `NPSN ${profile.npsn}` : ""}
              </p>
            ) : null}
          </div>
          {profile?.logo ? <div className="h-16 w-16 shrink-0" /> : null}
        </div>
      </header>
      <div className="mt-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
          {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
        </p>
        <h2 className="mt-1 font-heading text-base font-bold">{doc.title || "Judul Dokumen"}</h2>
      </div>

      {isAtP ? (
        <>
          <Section title="Identitas">
            <table className="w-full border-collapse">
              <tbody>
                <Field label="Mata Pelajaran" value={doc.subject} />
                <Field label="Jenjang / Fase" value={`${doc.level} — Fase ${doc.phase}`} />
                <Field label="Kelas" value={doc.grade} />
                <Field label="Tahun Ajaran" value={doc.academic_year} />
                <Field label="Guru Penyusun" value={doc.teacher_name} />
              </tbody>
            </table>
          </Section>
          <Section title={cpLabel}>
            <p className="whitespace-pre-line">{doc.cp || "-"}</p>
          </Section>
          <Section title="Alur Tujuan Pembelajaran">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="border border-slate-400 px-2 py-1.5 w-10">No</th>
                  <th className="border border-slate-400 px-2 py-1.5">Tujuan Pembelajaran</th>
                  <th className="border border-slate-400 px-2 py-1.5">Materi / Konten Pendukung</th>
                </tr>
              </thead>
              <tbody>
                {doc.atp_entries.length === 0 ? (
                  <tr>
                    <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-500" colSpan={3}>
                      Belum ada alur tujuan pembelajaran.
                    </td>
                  </tr>
                ) : (
                  doc.atp_entries.map((entry) => (
                    <tr key={entry.order}>
                      <td className="border border-slate-400 px-2 py-1.5 text-center">{entry.order}</td>
                      <td className="border border-slate-400 px-2 py-1.5">{entry.objective || "-"}</td>
                      <td className="border border-slate-400 px-2 py-1.5">{entry.content || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Section>
        </>
      ) : isLkpd ? (
        <LkpdBody doc={doc} />
      ) : isSumatif ? (
        <SumatifBody doc={doc} cpLabel={cpLabel} />
      ) : isKktp ? (
        <>
          <Section title="Identitas">
            <table className="w-full border-collapse">
              <tbody>
                <Field label="Mata Pelajaran" value={doc.subject} />
                <Field label="Jenjang / Fase" value={`${doc.level} — Fase ${doc.phase}`} />
                <Field label="Kelas" value={doc.grade} />
                <Field label="Tahun Ajaran" value={doc.academic_year} />
                <Field label="Guru Penyusun" value={doc.teacher_name} />
                <Field label={cpLabel} value={doc.cp} />
              </tbody>
            </table>
          </Section>
          <Section title={`Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)${doc.kkm_score ? ` — KKM ${doc.kkm_score}` : ""}`}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="border border-slate-400 px-2 py-1.5 w-40">Rentang Nilai</th>
                  <th className="border border-slate-400 px-2 py-1.5">Deskripsi Kriteria</th>
                </tr>
              </thead>
              <tbody>
                {doc.kktp_intervals.length === 0 ? (
                  <tr>
                    <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-500" colSpan={2}>
                      Belum ada interval KKTP.
                    </td>
                  </tr>
                ) : (
                  doc.kktp_intervals.map((interval, i) => (
                    <tr key={`${interval.range_label}-${i}`}>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold">
                        {interval.range_label}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5">{interval.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Section>
        </>
      ) : (
        <>
          <Section title="A. Identitas">
            <table className="w-full border-collapse">
              <tbody>
                <Field label="Kurikulum" value={curriculum?.name ?? doc.curriculum} />
                <Field label="Jenjang / Kelas" value={`${doc.level}${doc.grade ? ` — Kelas ${doc.grade}` : ""}`} />
                <Field label="Fase" value={doc.phase} />
                <Field label="Mata Pelajaran" value={doc.subject} />
                <Field label="Alokasi Waktu" value={doc.time_allocation} />
                <Field label="Tahun Ajaran" value={doc.academic_year} />
                <Field label="Guru Pengampu" value={doc.teacher_name} />
                <Field label="NIP" value={doc.teacher_nip} />
              </tbody>
            </table>
          </Section>

          {hasText(doc.cp) && (
            <Section title={`B. ${cpLabel}`}>
              <p className="whitespace-pre-line">{doc.cp}</p>
            </Section>
          )}

          {doc.objectives.length > 0 && (
            <Section title="C. Tujuan Pembelajaran">
              <ol className="list-decimal space-y-1 pl-5">
                {doc.objectives.map((objective, i) => (
                  <li key={i}>{objective}</li>
                ))}
              </ol>
            </Section>
          )}

          {doc.dimensions.length > 0 && (
            <Section title="D. Dimensi Profil Lulusan">
              <p>{doc.dimensions.join(", ")}</p>
            </Section>
          )}

          {doc.panca_cinta.length > 0 && (
            <Section title="D2. Nilai Panca Cinta (Kurikulum Berbasis Cinta)">
              <ul className="list-disc space-y-0.5 pl-5">
                {doc.panca_cinta.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="E. Pendekatan, Model, Metode, dan Strategi">
            <table className="w-full border-collapse">
              <tbody>
                <Field label="Pendekatan" value={approach ? approach.name : doc.approach} />
                {doc.approach === "deep_learning" && (
                  <Field
                    label="Prinsip Pembelajaran Mendalam"
                    value="Berkesadaran (mindful), Bermakna (meaningful), Menggembirakan (joyful) — pengalaman belajar: memahami, mengaplikasi, merefleksi"
                  />
                )}
                <Field label="Model Pembelajaran" value={model ? model.name : doc.model} />
                <Field label="Metode Pembelajaran" value={method ? method.name : doc.method} />
                <Field label="Strategi Pembelajaran" value={strategy ? strategy.name : doc.strategy} />
              </tbody>
            </table>
          </Section>

          {(hasText(doc.meaningful_understanding) || hasText(doc.trigger_questions)) && (
            <Section title="F. Pemahaman Bermakna & Pertanyaan Pemantik">
              {hasText(doc.meaningful_understanding) && (
                <p>
                  <span className="font-semibold">Pemahaman bermakna: </span>
                  {doc.meaningful_understanding}
                </p>
              )}
              {hasText(doc.trigger_questions) && (
                <p className="mt-1">
                  <span className="font-semibold">Pertanyaan pemantik: </span>
                  {doc.trigger_questions}
                </p>
              )}
            </Section>
          )}

          <Section title="G. Langkah-Langkah Pembelajaran">
            <div className="space-y-3">
              {hasText(doc.intro_activities) && (
                <div>
                  <p className="font-semibold">1. Kegiatan Pendahuluan</p>
                  <p className="whitespace-pre-line pl-4">{doc.intro_activities}</p>
                </div>
              )}
              {doc.core_activities.length > 0 && (
                <div>
                  <p className="font-semibold">2. Kegiatan Inti</p>
                  <table className="mt-1 w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-left">
                        <th className="border border-slate-400 px-2 py-1.5 w-10">No</th>
                        <th className="border border-slate-400 px-2 py-1.5">Tahap / Sintaks</th>
                        <th className="border border-slate-400 px-2 py-1.5">Deskripsi Kegiatan</th>
                        <th className="border border-slate-400 px-2 py-1.5 w-24">Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.core_activities.map((step, i) => (
                        <tr key={`${step.phase}-${i}`}>
                          <td className="border border-slate-400 px-2 py-1.5 text-center">{i + 1}</td>
                          <td className="border border-slate-400 px-2 py-1.5">{step.phase || "-"}</td>
                          <td className="border border-slate-400 px-2 py-1.5">{step.description || "-"}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center">
                            {step.duration_min ? `${step.duration_min} mnt` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {hasText(doc.closing_activities) && (
                <div>
                  <p className="font-semibold">3. Kegiatan Penutup</p>
                  <p className="whitespace-pre-line pl-4">{doc.closing_activities}</p>
                </div>
              )}
            </div>
          </Section>

          <Section title="H. Asesmen">
            <table className="w-full border-collapse">
              <tbody>
                {hasText(doc.diagnostic_assessment) && <Field label="Asesmen Diagnostik / Awal" value={doc.diagnostic_assessment} />}
                {hasText(doc.formative_assessment) && <Field label="Asesmen Formatif" value={doc.formative_assessment} />}
                {hasText(doc.summative_assessment) && <Field label="Asesmen Sumatif" value={doc.summative_assessment} />}
              </tbody>
            </table>
          </Section>

          {(hasText(doc.media) || hasText(doc.sources)) && (
            <Section title="I. Media, Alat, dan Sumber Belajar">
              {hasText(doc.media) && (
                <p>
                  <span className="font-semibold">Media & alat: </span>
                  {doc.media}
                </p>
              )}
              {hasText(doc.sources) && (
                <p>
                  <span className="font-semibold">Sumber belajar: </span>
                  {doc.sources}
                </p>
              )}
            </Section>
          )}

          {(hasText(doc.remedial) || hasText(doc.enrichment)) && (
            <Section title="J. Remedial & Pengayaan">
              {hasText(doc.remedial) && (
                <p>
                  <span className="font-semibold">Remedial: </span>
                  {doc.remedial}
                </p>
              )}
              {hasText(doc.enrichment) && (
                <p>
                  <span className="font-semibold">Pengayaan: </span>
                  {doc.enrichment}
                </p>
              )}
            </Section>
          )}
        </>
      )}

      <footer className="mt-10 flex items-end justify-between text-[12px]">
        <div className="w-1/2">
          <p>Mengetahui,</p>
          <p>Kepala Satuan Pendidikan</p>
          <div className="h-16" />
          <p className="font-semibold underline" data-testid="sheet-principal-name">
            {profile?.principal_name || "................................................"}
          </p>
          {profile?.principal_nip ? <p>NIP. {profile.principal_nip}</p> : null}
        </div>
        <div className="w-1/2 text-right">
          <p>
            {profile?.city ? `${profile.city}, ` : ""}
            {doc.academic_year || "......................."}
          </p>
          <p>Guru Mata Pelajaran</p>
          <div className="h-16" />
          <p className="font-semibold underline">
            {doc.teacher_name || "................................................"}
          </p>
          {doc.teacher_nip ? <p>NIP. {doc.teacher_nip}</p> : null}
        </div>
      </footer>
    </article>
  );
}
