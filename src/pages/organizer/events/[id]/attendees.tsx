import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useEvent } from '../../../../lib/api'
import { useAuth } from '../../../../lib/AuthContext'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

interface Attendee {
  UserId: number
  UserName: string
  UserEmail: string
  EventId: number
  Event: {
    Id: number
    Title: string
    StartDate: string
    EndDate: string
    Location: string
  }
  AddedAt: string
}

export default function OrganizerEventAttendeesPage() {

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
