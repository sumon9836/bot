'use client';

import { Header } from '../components/Header';
import { PairForm } from '../components/PairForm';
import { SessionsList } from '../components/SessionsList';
import { BannedUsersPanel } from '../components/BannedUsersPanel';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function Dashboard() {
  const { toasts, showToast, removeToast } = useToast();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePairSuccess = (number: string) => {
    showToast('Success', `Phone number ${number} paired successfully!`, 'success');
  };

  return (
    <>
      <Header onRefresh={handleRefresh} showRefreshButton={true} />
      
      <main className="main-content">
        {/* Action Section */}
        <section className="action-section">
          <div className="action-cards">
            <PairForm 
              onSuccess={handlePairSuccess}
              showToast={showToast}
            />
          </div>
        </section>

        {/* Banned Users Section */}
        <BannedUsersPanel showToast={showToast} />

        {/* Sessions Section */}
        <SessionsList showToast={showToast} />
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}