/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'lecturer' | 'student';
export type AcademicLevel = '100L' | '200L' | '300L' | '400L' | '500L' | 'N/A';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  level: AcademicLevel;
  department: string;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  level: AcademicLevel;
  semester: 'First' | 'Second';
  lecturerId: string;
  summary?: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Quiz {
  id: string;
  materialId: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface ReadingHistory {
  id: string;
  uid: string;
  materialId: string;
  viewedAt: string;
}
