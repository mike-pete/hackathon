"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeProfile } from "@/lib/resume-profile";
import type { GeneratedCV, JobTarget } from "@/lib/types";

const ACCENT = "#2563eb";
const INK = "#18181b";
const MUTED = "#52525b";
const RULE = "#e4e4e7";

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    color: INK,
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 21,
    letterSpacing: -0.3,
    color: INK,
  },
  contacts: {
    marginTop: 6,
    fontSize: 8.5,
    color: MUTED,
  },
  rule: {
    marginTop: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  headline: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: ACCENT,
    marginBottom: 6,
  },
  summary: {
    fontSize: 9.5,
    color: "#3f3f46",
    marginBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 6,
  },
  skills: {
    fontSize: 9.5,
    color: INK,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: ACCENT,
    marginTop: 5.5,
    marginRight: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: "#27272a",
  },
  tailored: {
    marginTop: 2,
    fontSize: 8,
    color: "#a1a1aa",
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#a1a1aa",
  },
});

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function ResumePdf({
  profile,
  cv,
  job,
}: {
  profile: ResumeProfile;
  cv: GeneratedCV;
  job: JobTarget;
}) {
  return (
    <Document
      title={`${profile.name} — Resume`}
      author={profile.name}
      subject={job.title ? `Tailored for ${job.title}` : "Resume"}
      creator="Tailor"
    >
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.contacts.length > 0 && (
            <Text style={styles.contacts}>{profile.contacts.join("   ·   ")}</Text>
          )}
        </View>

        <View style={styles.rule} />

        <Text style={styles.headline}>{cv.headline}</Text>
        <Text style={styles.summary}>{cv.summary}</Text>

        {cv.skills.length > 0 && (
          <Section label="Skills">
            <Text style={styles.skills}>{cv.skills.join("  ·  ")}</Text>
          </Section>
        )}

        {cv.bullets.length > 0 && (
          <Section label="Experience">
            {cv.bullets.map((b) => (
              <View style={styles.bulletRow} key={b.id} wrap={false}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b.text}</Text>
              </View>
            ))}
          </Section>
        )}

        {cv.coverNote ? (
          <Section label="Note">
            <Text style={styles.bulletText}>{cv.coverNote}</Text>
          </Section>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>{profile.name}</Text>
          {job.title ? <Text style={styles.tailored}>Tailored for {job.title}{job.company ? ` · ${job.company}` : ""}</Text> : <Text />}
        </View>
      </Page>
    </Document>
  );
}
