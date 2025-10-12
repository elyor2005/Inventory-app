"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import ReactMarkdown from "react-markdown";

interface Inventory {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string | null;
  isPublic: boolean;
  tags: string[];
  customFields: any[];
  customIdFormat: any[];
  allowedUsers: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (params.id) {
      fetchInventory();
    }
  }, [params.id]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
      } else {
        router.push("/inventories");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      router.push("/inventories");
    } finally {
      setLoading(false);
    }
  };

  const deleteInventory = async () => {
    if (!confirm("Are you sure you want to delete this inventory? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/inventories");
      }
    } catch (error) {
      console.error("Error deleting inventory:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Inventory not found</div>
      </div>
    );
  }

  const isOwner = session?.user.id === inventory.creator.id;
  const isAdmin = session?.user.role === "admin";
  const canEdit = isOwner || isAdmin;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "items", label: "Items" },
    { id: "settings", label: "Settings", requiresEdit: true },
    { id: "fields", label: "Custom Fields", requiresEdit: true },
    { id: "customid", label: "Custom ID", requiresEdit: true },
    { id: "access", label: "Access Control", requiresEdit: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Link href="/inventories" className="hover:text-blue-600 dark:hover:text-blue-400">
                My Inventories
              </Link>
              <span>→</span>
              <span>{inventory.title}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{inventory.title}</h1>
                  {inventory.isPublic && <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">Public</span>}
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-full">{inventory.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <img src={inventory.creator.image || ""} alt={inventory.creator.name || "User"} className="w-6 h-6 rounded-full" />
                  <span>Created by {inventory.creator.name || inventory.creator.email}</span>
                  <span>•</span>
                  <span>{new Date(inventory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <Link href={`/inventories/${inventory.id}/edit`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                    Edit
                  </Link>
                  <button onClick={deleteInventory} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b dark:border-gray-700">
            <div className="flex gap-4 overflow-x-auto">
              {tabs.map((tab) => {
                if (tab.requiresEdit && !canEdit) return null;

                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Image */}
                {inventory.image && (
                  <div className="mb-6">
                    <img src={inventory.image} alt={inventory.title} className="w-full max-h-96 object-cover rounded-lg" />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{inventory.description}</ReactMarkdown>
                  </div>
                </div>

                {/* Tags */}
                {inventory.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {inventory.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 pt-6 border-t dark:border-gray-700">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{inventory.allowedUsers.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Users with Access</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{new Date(inventory.updatedAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Updated</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "items" && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No items yet in this inventory</p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">Add First Item</button>
              </div>
            )}

            {activeTab === "settings" && canEdit && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Settings tab - Coming in next step</p>
              </div>
            )}

            {activeTab === "fields" && canEdit && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Custom fields configuration - Coming in Phase 8</p>
              </div>
            )}

            {activeTab === "customid" && canEdit && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Custom ID format - Coming in Phase 9</p>
              </div>
            )}

            {activeTab === "access" && canEdit && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Access control settings - Coming soon</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
