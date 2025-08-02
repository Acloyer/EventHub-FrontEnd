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
  // TODO: Implement organizer blacklist page
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Organizer Blacklist
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This page is under construction.
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
