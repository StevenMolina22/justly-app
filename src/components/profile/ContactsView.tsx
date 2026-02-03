"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, QrCode, ScanLine, Trash2 } from "lucide-react";
import { useAddressBook } from "@/hooks/user/useAddressBook";
import { AddContactDialog } from "@/components/profile/AddContactDialog";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";
import { MyQRModal } from "./MyQRModal";
import { ScanContactModal } from "./ScanContactModal";
import { AddScannedContactDialog } from "./AddScannedContactDialog";
import { shortenAddress } from "@/util/wallet";

export const ContactsView = () => {
  const { address } = useAccount();
  const { contacts, removeContact } = useAddressBook();
  const [searchTerm, setSearchTerm] = useState("");

  // Modals State
  const [showMyQR, setShowMyQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddScanned, setShowAddScanned] = useState(false);
  const [scannedAddress, setScannedAddress] = useState("");

  const filteredContacts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term),
    );
  }, [contacts, searchTerm]);

  const handleScanSuccess = (address: string) => {
    setShowScanner(false);
    setScannedAddress(address);
    setShowAddScanned(true);
  };

  return (
    // REMOVED: min-h-[50vh]
    // KEPT: pb-20 to ensure the floating button doesn't cover the last item
    <div className="flex flex-col gap-5 pb-20">
      {/* 1. Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowMyQR(true)}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors py-6"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-1">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="font-semibold text-[#1b1c23]">My Code</span>
        </button>

        <button
          onClick={() => setShowScanner(true)}
          className="bg-[#1b1c23] p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-[#2c2d33] transition-colors py-6 text-white"
        >
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-1">
            <ScanLine className="w-6 h-6" />
          </div>
          <span className="font-semibold">Scan QR</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-gray-200 rounded-2xl py-6 pl-11 pr-4 text-sm font-bold focus-visible:ring-[#8c8fff] focus-visible:border-[#8c8fff] transition-colors shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-manrope font-extrabold text-gray-800 uppercase tracking-wide ml-1 text-sm">
          Saved Identities
        </h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
          {filteredContacts.length}
        </span>
      </div>

      {/* Contacts List */}
      {/* REMOVED: flex-1 (so it doesn't force expansion) */}
      <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
        {filteredContacts.length > 0 ? (
          <div className="flex flex-col">
            {filteredContacts.map((c) => (
              <div
                key={c.address}
                className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-xl cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative shrink-0 border border-gray-100">
                  {c.avatar ? (
                    <Image
                      src={c.avatar}
                      alt={c.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#1b1c23] truncate group-hover:text-[#8c8fff] transition-colors">
                    {c.name}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 bg-gray-50 w-fit px-1.5 py-0.5 rounded-md mt-0.5">
                    {shortenAddress(c.address)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContact(c.address);
                  }}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4 " />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 grayscale opacity-50">
              <Image
                src="/images/profiles-mockup/profile-1.jpg"
                width={64}
                height={64}
                alt="Empty"
                className="opacity-50"
              />
            </div>
            <p className="text-sm font-bold text-gray-400">
              {searchTerm ? "No matches found" : "No contacts yet"}
            </p>
            <p className="text-xs text-gray-300 mt-1 max-w-50">
              {searchTerm
                ? "Try searching for a different name or address."
                : "Add friends to quickly select them in future disputes."}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="sticky bottom-4 z-20">
        <AddContactDialog variant="full" />
      </div>

      {/* --- Modals --- */}
      <MyQRModal
        address={address}
        isOpen={showMyQR}
        onClose={() => setShowMyQR(false)}
      />

      <ScanContactModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      <AddScannedContactDialog
        isOpen={showAddScanned}
        onClose={() => setShowAddScanned(false)}
        scannedAddress={scannedAddress}
      />
    </div>
  );
};
