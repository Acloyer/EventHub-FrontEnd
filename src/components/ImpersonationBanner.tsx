import React from 'react'
import { useAuth } from '../lib/AuthContext'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function ImpersonationBanner() {
  const { isImpersonating, stopImpersonating } = useAuth()

  if (!isImpersonating) {
    return null
  }

  return (
    <div></div>
    // <div className="bg-yellow-400 border-b border-yellow-500">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex items-center justify-between py-3">
    //       <div className="flex items-center">
    //         <div className="flex-shrink-0">
    //           <svg className="h-5 w-5 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
    //             <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    //           </svg>
    //         </div>
    //         <div className="ml-3">
    //           <p className="text-sm font-medium text-yellow-800">
    //             <span className="md:hidden">You are impersonating another user</span>
    //             <span className="hidden md:inline">
    //               You are currently impersonating another user account. All actions will be performed as this user.
    //             </span>
    //           </p>
    //         </div>
    //       </div>
    //       <div className="flex items-center space-x-3">
    //         <button
    //           onClick={stopImpersonating}
    //           className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
    //         >
    //           Return to My Account
    //         </button>
    //         <button
    //           onClick={stopImpersonating}
    //           className="text-yellow-800 hover:text-yellow-900 transition-colors duration-200"
    //         >
    //           <XMarkIcon className="h-5 w-5" />
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  )
} 