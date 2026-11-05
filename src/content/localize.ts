import { useMemo } from "react";
import { glossary } from "./glossary";
import { lessons, tracks } from "./lessons";
import { signatures, statuses } from "./pocket";
import { applyLesson } from "./patches";
import { glossaryVi, signatureVi, statusVi, trackCopy } from "./shell";
import { copy } from "./ui";
import type { Lesson, Track } from "./types";
import { usePrefs, type Locale } from "@/lib/prefs";
import { bodyVi } from "./vi/body";
import { changeVi } from "./vi/change";
import { edgeVi } from "./vi/edge";
import { listVi } from "./vi/list";
import { programVi } from "./vi/program";
import { requestVi } from "./vi/request";

const lessonVi: Record<string, Parameters<typeof applyLesson>[1]> = {
  ...requestVi,
  ...bodyVi,
  ...listVi,
  ...programVi,
  ...changeVi,
  ...edgeVi,
};

export function localizeLesson(lesson: Lesson, locale: Locale): Lesson {
  if (locale === "en") return lesson;
  return applyLesson(lesson, lessonVi[lesson.slug]);
}

export function localizedLessons(locale: Locale): Lesson[] {
  return lessons.map((lesson) => localizeLesson(lesson, locale));
}

export function localizedTracks(locale: Locale): Track[] {
  return tracks.map((track) => ({
    ...track,
    title: trackCopy[locale][track.id].title,
    summary: trackCopy[locale][track.id].summary,
  }));
}

export function useUi() {
  return copy[usePrefs().locale];
}

export function useLessons(): Lesson[] {
  const { locale } = usePrefs();
  return useMemo(() => localizedLessons(locale), [locale]);
}

export function useTracks(): Track[] {
  const { locale } = usePrefs();
  return useMemo(() => localizedTracks(locale), [locale]);
}

export function useGlossary() {
  const { locale } = usePrefs();
  return useMemo(() => {
    if (locale === "en") return glossary;
    return glossary.map((entry, index) => ({
      term: entry.term,
      body: glossaryVi[index]?.body ?? entry.body,
    }));
  }, [locale]);
}

export function usePocket() {
  const { locale } = usePrefs();
  return useMemo(() => {
    if (locale === "en") return { signatures, statuses };
    return {
      signatures: signatures.map((item, index) => ({
        ...item,
        title: signatureVi[index]?.title ?? item.title,
        note: signatureVi[index]?.note ?? item.note,
      })),
      statuses: statuses.map((item, index) => ({
        ...item,
        when: statusVi[index]?.when ?? item.when,
        who: statusVi[index]?.who ?? item.who,
      })),
    };
  }, [locale]);
}
