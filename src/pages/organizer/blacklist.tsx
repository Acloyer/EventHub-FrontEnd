import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/AuthContext'
import { getMyBlacklist, addToBlacklist, removeFromBlacklist } from '../../lib/api'
import { OrganizerBlacklistDto, CreateBlacklistEntryDto } from '../../lib/types'
import LoadingSpinner from '../../components/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function OrganizerBlacklistPage() {

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
