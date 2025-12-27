/**
 * Base Repository Pattern with Firestore
 * 
 * Based on blueprint: docs/strategy-governance/blueprint/system/02-system-architecture.md
 * 
 * Provides standardized data access with Result pattern.
 */

import { inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  UpdateData
} from '@angular/fire/firestore';
import { Result, Ok, Err, NotFoundError, ValidationError } from '../models/result.type';

export abstract class BaseRepository<T extends DocumentData> {
  protected firestore = inject(Firestore);
  protected abstract collectionName: string;

  /**
   * Get document by ID
   */
  async findById(id: string): Promise<Result<T, NotFoundError>> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return Err(
          new NotFoundError(
            `Document not found in ${this.collectionName}`,
            this.collectionName,
            id
          )
        );
      }

      return Ok({ id: docSnap.id, ...docSnap.data() } as T);
    } catch (error) {
      return Err(
        new NotFoundError(
          `Error fetching document: ${(error as Error).message}`,
          this.collectionName,
          id
        )
      );
    }
  }

  /**
   * Get all documents with optional query constraints
   */
  async findAll(constraints?: QueryConstraint[]): Promise<Result<T[], Error>> {
    try {
      const collectionRef = collection(this.firestore, this.collectionName);
      const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);

      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));

      return Ok(documents);
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * Create a new document
   */
  async create(data: WithFieldValue<Omit<T, 'id'>>): Promise<Result<string, Error>> {
    try {
      const collectionRef = collection(this.firestore, this.collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return Ok(docRef.id);
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * Create a document with specific ID
   */
  async createWithId(id: string, data: WithFieldValue<Omit<T, 'id'>>): Promise<Result<void, Error>> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      await setDoc(docRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * Update a document
   */
  async update(id: string, data: UpdateData<T>): Promise<Result<void, Error>> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });

      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      await deleteDoc(docRef);

      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * Find documents with specific field value
   */
  async findByField(fieldName: string, value: any): Promise<Result<T[], Error>> {
    return this.findAll([where(fieldName, '==', value)]);
  }

  /**
   * Find documents with ordering and limit
   */
  async findWithOptions(options: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitTo?: number;
  }): Promise<Result<T[], Error>> {
    const constraints: QueryConstraint[] = [];

    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    if (options.limitTo) {
      constraints.push(limit(options.limitTo));
    }

    return this.findAll(constraints);
  }

  /**
   * Check if document exists
   */
  async exists(id: string): Promise<boolean> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }

  /**
   * Count documents (with optional constraints)
   */
  async count(constraints?: QueryConstraint[]): Promise<Result<number, Error>> {
    const result = await this.findAll(constraints);
    if (result.success) {
      return Ok(result.value.length);
    }
    return result;
  }
}
